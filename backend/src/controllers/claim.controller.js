/**
 * controllers/claim.controller.js
 *
 * POST /quests/:id/claim
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * THE RACE CONDITION PROBLEM
 * ──────────────────────────
 * At peak time 50+ couriers are watching the same radar. They all see a "Maggi
 * + Chai" quest and tap "Claim" within milliseconds of each other. Without a
 * concurrency primitive, every one of them would read status='open', all pass
 * the check, and all UPDATE to status='claimed' — assigning the same quest to
 * 50 people simultaneously.
 *
 * THE SOLUTION: SELECT … FOR UPDATE SKIP LOCKED
 * ──────────────────────────────────────────────
 * PostgreSQL row-level locking inside a transaction:
 *
 *   BEGIN;
 *
 *   -- Step 1: Try to acquire an exclusive row lock on this quest.
 *   -- SKIP LOCKED means: "if another transaction already holds the lock,
 *   --   don't wait — return 0 rows immediately."
 *   -- This is intentionally non-blocking; waiting would just queue all
 *   -- 50 couriers up and let them all win in turn.
 *   SELECT id, status, requester_id, bounty_amount, bounty_type
 *     FROM quests
 *    WHERE id = $questId
 *      AND status = 'open'          -- guard: only lockable if still open
 *   FOR UPDATE SKIP LOCKED;
 *
 *   -- Step 2: If we got 0 rows, someone else already locked it.
 *   --   ROLLBACK and return 409 to the client.
 *
 *   -- Step 3: If we got the row, nobody else has it. Atomically update:
 *   UPDATE quests
 *      SET status = 'claimed',
 *          courier_id = $userId
 *    WHERE id = $questId;
 *
 *   COMMIT;
 *
 * Why SKIP LOCKED and not FOR UPDATE alone?
 *   FOR UPDATE alone blocks — all 49 losers queue and take turns winning.
 *   SKIP LOCKED returns immediately to all losers, letting us send a fast
 *   "already claimed" 409 rather than making clients wait in a queue.
 *
 * Why also check status = 'open' in the SELECT?
 *   Double-safety. Even if SKIP LOCKED succeeds (race won), the row might
 *   have been cancelled or expired. The status check ensures we only lock
 *   rows we're actually allowed to claim.
 *
 * Why not use Redis / application-level locking?
 *   The database IS the source of truth. Putting the lock anywhere else
 *   (Redis SET NX, in-memory mutex) creates a split-brain risk where the
 *   lock store and DB get out of sync on crash. DB-level is safest.
 *
 * SEQUENCE DIAGRAM (happy path):
 *
 *   Courier A  ──► POST /quests/xyz/claim
 *                    │  BEGIN
 *                    │  SELECT … FOR UPDATE SKIP LOCKED  ← gets lock
 *                    │  UPDATE status='claimed'
 *                    │  INSERT transaction record
 *                    │  UPDATE user stats
 *                    │  COMMIT
 *                    └─ 200 OK  { quest, message }
 *                         │
 *                         └── Socket.io broadcast → quest:claimed
 *                               ↓
 *                    All other radar clients remove card from feed
 *
 * SEQUENCE DIAGRAM (loser path — concurrent request):
 *
 *   Courier B  ──► POST /quests/xyz/claim  (arrives 3ms later)
 *                    │  BEGIN
 *                    │  SELECT … FOR UPDATE SKIP LOCKED  ← 0 rows (locked by A)
 *                    │  ROLLBACK
 *                    └─ 409 ALREADY_CLAIMED  { error }
 */

'use strict';

const { withTransaction } = require('../db/pool');
const AppError            = require('../utils/AppError');
const asyncHandler        = require('../utils/asyncHandler');
const { sendSuccess }     = require('../utils/response');
const {
  emitQuestClaimed,
  emitQPUpdated,
} = require('../socket');

// ── POST /quests/:id/claim ────────────────────────────────────────────────────
const claimQuest = asyncHandler(async (req, res) => {
  const questId  = req.params.id;
  const courierId = req.user.id;

  // ── Sanity: couriers cannot claim their own quest ──────────────────────────
  // (also enforced in the transaction below, but fail fast here)
  // We check this outside the TX to avoid an unnecessary round-trip.

  const result = await withTransaction(async (client) => {

    // ════════════════════════════════════════════════════════════════════════
    // STEP 1 — Attempt to acquire exclusive row lock on the quest.
    //
    // Conditions baked into the WHERE clause (all must hold):
    //   • id matches
    //   • status = 'open'   → only claimable if still open
    //
    // FOR UPDATE            → acquire exclusive row lock
    // SKIP LOCKED           → if already locked by another TX, return 0 rows
    //                         instead of blocking (non-blocking behaviour)
    // ════════════════════════════════════════════════════════════════════════
    const { rows: lockRows } = await client.query(
      `SELECT id, status, requester_id, bounty_amount, bounty_type,
              item_description, pickup_location, dropoff_location
         FROM quests
        WHERE id = $1
          AND status = 'open'
        FOR UPDATE SKIP LOCKED`,
      [questId]
    );

    // ════════════════════════════════════════════════════════════════════════
    // STEP 2 — Evaluate the lock result.
    //
    // Case A: 0 rows returned from SKIP LOCKED
    //   → another transaction holds the lock right now (race lost)
    //   → we MUST distinguish this from "quest doesn't exist"
    //   → do a plain SELECT to check current reality
    // ════════════════════════════════════════════════════════════════════════
    if (lockRows.length === 0) {
      // Check whether the quest exists at all, regardless of lock
      const { rows: checkRows } = await client.query(
        'SELECT id, status, courier_id FROM quests WHERE id = $1',
        [questId]
      );

      if (checkRows.length === 0) {
        throw new AppError('Quest not found', 404, 'QUEST_NOT_FOUND');
      }

      const current = checkRows[0];

      if (current.status === 'open') {
        // Row exists and is open but SKIP LOCKED returned nothing:
        // another concurrent TX has the lock this instant.
        throw new AppError(
          'This quest was just claimed by someone else. Try another one!',
          409,
          'ALREADY_CLAIMED'
        );
      }

      // Quest is no longer open (claimed/cancelled/completed)
      throw new AppError(
        `Quest is no longer available (status: ${current.status})`,
        409,
        'QUEST_UNAVAILABLE'
      );
    }

    // ════════════════════════════════════════════════════════════════════════
    // STEP 3 — We hold the lock. Validate business rules.
    // ════════════════════════════════════════════════════════════════════════
    const quest = lockRows[0];

    // Cannot claim your own quest
    if (quest.requester_id === courierId) {
      throw new AppError(
        'You cannot claim your own quest',
        400,
        'SELF_CLAIM_FORBIDDEN'
      );
    }

    // Check expiry
    if (quest.expires_at && new Date(quest.expires_at) < new Date()) {
      // Mark expired as cancelled while we have the lock
      await client.query(
        `UPDATE quests
            SET status = 'cancelled', cancel_reason = 'Expired'
          WHERE id = $1`,
        [questId]
      );
      throw new AppError('This quest has expired', 410, 'QUEST_EXPIRED');
    }

    // ════════════════════════════════════════════════════════════════════════
    // STEP 4 — Atomically assign courier and flip status.
    //          The status-transition trigger in SQL validates open→claimed.
    // ════════════════════════════════════════════════════════════════════════
    const { rows: updatedRows } = await client.query(
      `UPDATE quests
          SET status     = 'claimed',
              courier_id = $2
        WHERE id = $1
        RETURNING *`,
      [questId, courierId]
    );

    const updatedQuest = updatedRows[0];

    // ════════════════════════════════════════════════════════════════════════
    // STEP 5 — Record a "held bounty" transaction on the requester if QP mode.
    //          This represents QP being earmarked (not yet paid — paid on
    //          completion). We record it now so the requester's activity log
    //          reflects the reservation immediately.
    // ════════════════════════════════════════════════════════════════════════
    if (quest.bounty_type === 'qp') {
      const { rows: rRows } = await client.query(
        'SELECT qp_balance FROM users WHERE id = $1 FOR UPDATE',
        [quest.requester_id]
      );
      const reqBalance = rRows[0].qp_balance;

      // Debit QP from requester at claim time (escrowed until completion/refund)
      if (reqBalance < quest.bounty_amount) {
        throw new AppError(
          'Requester no longer has sufficient QP for this bounty',
          400,
          'INSUFFICIENT_QP'
        );
      }

      const newReqBalance = reqBalance - quest.bounty_amount;
      await client.query(
        'UPDATE users SET qp_balance = $1 WHERE id = $2',
        [newReqBalance, quest.requester_id]
      );

      await client.query(
        `INSERT INTO transactions
           (user_id, type, amount, balance_before, balance_after,
            quest_id, description)
         VALUES ($1,'quest_posted',$2,$3,$4,$5,$6)`,
        [
          quest.requester_id,
          -quest.bounty_amount,       // negative = debit
          reqBalance,
          newReqBalance,
          questId,
          `Bounty held for quest: ${quest.item_description.slice(0, 60)}`,
        ]
      );

      emitQPUpdated({
        userId:     quest.requester_id,
        newBalance: newReqBalance,
        delta:      -quest.bounty_amount,
        reason:     'Bounty held on claim',
      });
    }

    // ════════════════════════════════════════════════════════════════════════
    // STEP 6 — Load the courier's display name for the broadcast payload.
    // ════════════════════════════════════════════════════════════════════════
    const { rows: courierRows } = await client.query(
      'SELECT id, name, tier FROM users WHERE id = $1',
      [courierId]
    );
    const courier = courierRows[0];

    return { quest: updatedQuest, courier };
  });

  // ── Outside the transaction: broadcast to all connected clients ────────────
  // The TX is committed at this point — safe to tell the world.
  emitQuestClaimed({
    questId,
    courierId,
    courierName: result.courier.name,
    bounty:      result.quest.bounty_amount,
  });

  return sendSuccess(res, {
    message: `Quest claimed successfully! Head to ${result.quest.pickup_location}.`,
    quest:   result.quest,
    courier: result.courier,
  });
});

module.exports = { claimQuest };
