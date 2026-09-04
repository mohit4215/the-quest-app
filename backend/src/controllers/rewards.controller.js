/**
 * controllers/rewards.controller.js
 *
 * GET  /rewards/balance          — current QP balance + tier info
 * GET  /rewards/transactions     — paginated QP activity ledger
 * GET  /rewards/perks            — available campus shop perks
 * POST /rewards/redeem           — atomic QP deduction + receipt generation
 */

'use strict';

const { body }            = require('express-validator');
const { withTransaction, query } = require('../db/pool');
const AppError            = require('../utils/AppError');
const asyncHandler        = require('../utils/asyncHandler');
const { sendSuccess }     = require('../utils/response');
const { emitQPUpdated }   = require('../socket');
const { LEVELS }          = require('../constants/levels');

// ── Validators ────────────────────────────────────────────────────────────────
const redeemValidators = [
  body('perk_id').isUUID().withMessage('Valid perk_id required'),
];

// ── GET /rewards/balance ──────────────────────────────────────────────────────
const getBalance = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT qp_balance, tier, total_qp_earned,
            quests_completed, quests_posted
       FROM users WHERE id = $1`,
    [req.user.id]
  );

  const user       = rows[0];
  const levelIndex = LEVELS.findIndex(
    (l) => user.qp_balance >= l.minQP && user.qp_balance < l.maxQP
  );
  const currentLevel = LEVELS[levelIndex] ?? LEVELS[LEVELS.length - 1];
  const nextLevel    = LEVELS[levelIndex + 1] ?? null;

  const progress = nextLevel
    ? (user.qp_balance - currentLevel.minQP) /
      (nextLevel.minQP - currentLevel.minQP)
    : 1;

  return sendSuccess(res, {
    qp_balance:       user.qp_balance,
    tier:             user.tier,
    total_qp_earned:  user.total_qp_earned,
    quests_completed: user.quests_completed,
    quests_posted:    user.quests_posted,
    level: {
      current:        currentLevel,
      next:           nextLevel,
      progress:       parseFloat(progress.toFixed(4)),
      qp_to_next:     nextLevel ? nextLevel.minQP - user.qp_balance : 0,
    },
  });
});

// ── GET /rewards/transactions ─────────────────────────────────────────────────
const getTransactions = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const offset = (page - 1) * limit;

  const { rows } = await query(
    `SELECT t.id, t.type, t.amount, t.balance_before, t.balance_after,
            t.description, t.created_at,
            q.item_description AS quest_item
       FROM transactions t
       LEFT JOIN quests q ON q.id = t.quest_id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3`,
    [req.user.id, limit, offset]
  );

  const { rows: countRows } = await query(
    'SELECT COUNT(*) FROM transactions WHERE user_id = $1',
    [req.user.id]
  );

  return sendSuccess(res, rows, 200, {
    page,
    limit,
    total: parseInt(countRows[0].count),
  });
});

// ── GET /rewards/perks ────────────────────────────────────────────────────────
const getPerks = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT p.*,
            COUNT(pr.id)::int AS times_redeemed_by_me
       FROM perks p
       LEFT JOIN perk_redemptions pr
              ON pr.perk_id = p.id AND pr.user_id = $1
      WHERE p.is_available = TRUE
        AND (p.valid_until IS NULL OR p.valid_until > NOW())
      GROUP BY p.id
      ORDER BY p.category, p.qp_cost`,
    [req.user.id]
  );

  return sendSuccess(res, rows);
});

// ── POST /rewards/redeem ──────────────────────────────────────────────────────
/**
 * Atomic QP deduction flow:
 *
 *   BEGIN
 *   1. SELECT perk FOR SHARE           — verify perk exists and is available
 *   2. SELECT user … FOR UPDATE        — acquire exclusive lock on user row
 *   3. Check balance >= perk.qp_cost   — business rule (balance cannot go < 0)
 *   4. UPDATE users SET qp_balance     — deduct QP
 *   5. INSERT transactions (debit)     — append-only ledger entry
 *   6. INSERT perk_redemptions         — generate receipt with unique code
 *   7. UPDATE perks total_redeemed     — increment counter
 *   COMMIT
 *
 * Using FOR UPDATE on the user row prevents two concurrent redemptions from
 * both reading the same balance and both passing the balance check before
 * either writes the deduction (the classic "double-spend" race).
 */
const redeemPerk = asyncHandler(async (req, res) => {
  const { perk_id } = req.body;
  const userId = req.user.id;

  const receipt = await withTransaction(async (client) => {

    // ── 1. Lock perk row (FOR SHARE: multiple readers OK, blocks writers) ──
    const { rows: perkRows } = await client.query(
      `SELECT id, shop_name, offer_text, qp_cost, is_available, valid_until
         FROM perks
        WHERE id = $1
        FOR SHARE`,
      [perk_id]
    );

    if (!perkRows.length) {
      throw new AppError('Perk not found', 404, 'PERK_NOT_FOUND');
    }

    const perk = perkRows[0];

    if (!perk.is_available) {
      throw new AppError('This perk is currently unavailable', 400, 'PERK_UNAVAILABLE');
    }
    if (perk.valid_until && new Date(perk.valid_until) < new Date()) {
      throw new AppError('This perk has expired', 400, 'PERK_EXPIRED');
    }

    // ── 2. Lock user row exclusively ──────────────────────────────────────
    const { rows: userRows } = await client.query(
      `SELECT id, qp_balance FROM users WHERE id = $1 FOR UPDATE`,
      [userId]
    );

    const user = userRows[0];

    // ── 3. Balance check — the critical guard ─────────────────────────────
    // The CHECK (balance_after >= 0) on transactions also enforces this at
    // DB level, but we provide a meaningful error message here.
    if (user.qp_balance < perk.qp_cost) {
      throw new AppError(
        `Insufficient QP. You have ${user.qp_balance} QP but this perk costs ${perk.qp_cost} QP.`,
        400,
        'INSUFFICIENT_QP'
      );
    }

    // ── 4. Deduct QP ──────────────────────────────────────────────────────
    const newBalance = user.qp_balance - perk.qp_cost;

    await client.query(
      'UPDATE users SET qp_balance = $1 WHERE id = $2',
      [newBalance, userId]
    );

    // ── 5. Ledger entry ───────────────────────────────────────────────────
    const { rows: txnRows } = await client.query(
      `INSERT INTO transactions
         (user_id, type, amount, balance_before, balance_after, description)
       VALUES ($1, 'reward_redeemed', $2, $3, $4, $5)
       RETURNING id`,
      [
        userId,
        -perk.qp_cost,
        user.qp_balance,
        newBalance,
        `Redeemed: ${perk.offer_text} at ${perk.shop_name}`,
      ]
    );

    const txnId = txnRows[0].id;

    // ── 6. Redemption receipt ─────────────────────────────────────────────
    const { rows: redemptionRows } = await client.query(
      `INSERT INTO perk_redemptions (perk_id, user_id, txn_id)
       VALUES ($1, $2, $3)
       RETURNING id, receipt_code, redeemed_at`,
      [perk_id, userId, txnId]
    );

    // ── 7. Increment perk's total_redeemed counter ────────────────────────
    await client.query(
      'UPDATE perks SET total_redeemed = total_redeemed + 1 WHERE id = $1',
      [perk_id]
    );

    return {
      receipt_code: redemptionRows[0].receipt_code,
      redeemed_at:  redemptionRows[0].redeemed_at,
      perk: {
        id:         perk.id,
        shop_name:  perk.shop_name,
        offer_text: perk.offer_text,
        qp_cost:    perk.qp_cost,
      },
      qp_deducted:  perk.qp_cost,
      new_balance:  newBalance,
      transaction_id: txnId,
    };
  });

  // Notify client's device of updated balance in real-time
  emitQPUpdated({
    userId,
    newBalance: receipt.new_balance,
    delta:      -receipt.qp_deducted,
    reason:     `Redeemed perk at ${receipt.perk.shop_name}`,
  });

  return sendSuccess(res, {
    message:      `Perk redeemed! Show receipt code ${receipt.receipt_code} at ${receipt.perk.shop_name}.`,
    receipt_code: receipt.receipt_code,
    redeemed_at:  receipt.redeemed_at,
    perk:         receipt.perk,
    qp_deducted:  receipt.qp_deducted,
    new_balance:  receipt.new_balance,
    transaction_id: receipt.transaction_id,
  }, 201);
});

module.exports = {
  getBalance,
  getTransactions,
  getPerks,
  redeemPerk, redeemValidators,
};
