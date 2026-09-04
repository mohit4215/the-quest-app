/**
 * controllers/quests.controller.js
 *
 * GET  /quests              — paginated feed of open quests (radar)
 * GET  /quests/:id          — single quest detail
 * POST /quests              — create new quest, broadcast via Socket.io
 * POST /quests/:id/claim    — atomic claim with SELECT FOR UPDATE SKIP LOCKED
 * POST /quests/:id/pickup   — courier marks item picked up (open → in_transit)
 * POST /quests/:id/complete — courier marks delivery done, QP settled
 * POST /quests/:id/cancel   — requester cancels (only while open/claimed)
 * GET  /quests/my           — quests posted or claimed by req.user
 */

'use strict';

const { body, query: qv, param } = require('express-validator');
const { query, withTransaction }  = require('../db/pool');
const AppError     = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const {
  emitQuestCreated,
  emitQuestClaimed,
  emitQuestStatusChanged,
  emitQPUpdated,
} = require('../socket');

// ── Shared quest SELECT fragment ───────────────────────────────────────────────
const QUEST_SELECT = `
  q.id,
  q.requester_id,
  q.courier_id,
  q.item_description,
  q.notes,
  q.pickup_location,
  q.dropoff_location,
  q.bounty_type,
  q.bounty_amount,
  q.status,
  q.expires_at,
  q.claimed_at,
  q.picked_up_at,
  q.completed_at,
  q.cancelled_at,
  q.created_at,
  q.updated_at,
  json_build_object(
    'id',     r.id,
    'name',   r.name,
    'branch', r.branch,
    'hostel', r.hostel,
    'tier',   r.tier
  ) AS requester,
  CASE WHEN q.courier_id IS NOT NULL THEN
    json_build_object(
      'id',   c.id,
      'name', c.name,
      'tier', c.tier
    )
  END AS courier
`;

// ── Validators ─────────────────────────────────────────────────────────────────
const createValidators = [
  body('item_description')
    .trim().notEmpty().isLength({ max: 300 })
    .withMessage('Item description required (max 300 chars)'),
  body('pickup_location')
    .trim().notEmpty()
    .withMessage('Pickup location required'),
  body('dropoff_location')
    .trim().notEmpty()
    .withMessage('Drop-off location required'),
  body('bounty_type')
    .isIn(['qp', 'cash'])
    .withMessage('bounty_type must be qp or cash'),
  body('bounty_amount')
    .isInt({ min: 1, max: 500 })
    .withMessage('Bounty must be between 1 and 500'),
  body('notes').optional().trim().isLength({ max: 500 }),
  body('expires_in_minutes')
    .optional().isInt({ min: 10, max: 1440 })
    .withMessage('expires_in_minutes must be 10–1440'),
];

// ── GET /quests ────────────────────────────────────────────────────────────────
const getQuests = asyncHandler(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const limit  = Math.min(50, parseInt(req.query.limit) || 20);
  const offset = (page - 1) * limit;
  const status = req.query.status || 'open';

  const allowed = ['open', 'claimed', 'in_transit', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    throw new AppError('Invalid status filter', 400, 'INVALID_PARAM');
  }

  const { rows } = await query(
    `SELECT ${QUEST_SELECT}
       FROM quests q
       JOIN users r ON r.id = q.requester_id
       LEFT JOIN users c ON c.id = q.courier_id
      WHERE q.status = $1
      ORDER BY q.created_at DESC
      LIMIT $2 OFFSET $3`,
    [status, limit, offset]
  );

  const { rows: countRows } = await query(
    'SELECT COUNT(*) FROM quests WHERE status = $1',
    [status]
  );

  return sendSuccess(res, rows, 200, {
    page,
    limit,
    total: parseInt(countRows[0].count),
    hasMore: offset + rows.length < parseInt(countRows[0].count),
  });
});

// ── GET /quests/my ─────────────────────────────────────────────────────────────
const getMyQuests = asyncHandler(async (req, res) => {
  const role   = req.query.role || 'all'; // 'requester' | 'courier' | 'all'
  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const limit  = Math.min(50, parseInt(req.query.limit) || 20);
  const offset = (page - 1) * limit;

  let whereClause;
  let params;

  if (role === 'requester') {
    whereClause = 'q.requester_id = $1';
    params = [req.user.id, limit, offset];
  } else if (role === 'courier') {
    whereClause = 'q.courier_id = $1';
    params = [req.user.id, limit, offset];
  } else {
    whereClause = '(q.requester_id = $1 OR q.courier_id = $1)';
    params = [req.user.id, limit, offset];
  }

  const { rows } = await query(
    `SELECT ${QUEST_SELECT}
       FROM quests q
       JOIN users r ON r.id = q.requester_id
       LEFT JOIN users c ON c.id = q.courier_id
      WHERE ${whereClause}
      ORDER BY q.created_at DESC
      LIMIT $2 OFFSET $3`,
    params
  );

  return sendSuccess(res, rows, 200, { page, limit });
});

// ── GET /quests/:id ────────────────────────────────────────────────────────────
const getQuestById = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT ${QUEST_SELECT}
       FROM quests q
       JOIN users r ON r.id = q.requester_id
       LEFT JOIN users c ON c.id = q.courier_id
      WHERE q.id = $1`,
    [req.params.id]
  );

  if (!rows.length) throw new AppError('Quest not found', 404, 'QUEST_NOT_FOUND');
  return sendSuccess(res, rows[0]);
});

// ── POST /quests ───────────────────────────────────────────────────────────────
const createQuest = asyncHandler(async (req, res) => {
  const {
    item_description, notes,
    pickup_location, dropoff_location,
    bounty_type, bounty_amount,
    expires_in_minutes,
  } = req.body;

  // QP bounty: requester must have enough balance (held conceptually — no escrow table here)
  if (bounty_type === 'qp' && req.user.qp_balance < bounty_amount) {
    throw new AppError(
      `Insufficient QP balance. You have ${req.user.qp_balance} QP.`,
      400,
      'INSUFFICIENT_QP'
    );
  }

  const expiresAt = expires_in_minutes
    ? new Date(Date.now() + expires_in_minutes * 60_000)
    : null;

  const { rows } = await query(
    `INSERT INTO quests
       (requester_id, item_description, notes,
        pickup_location, dropoff_location,
        bounty_type, bounty_amount, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      req.user.id, item_description, notes ?? null,
      pickup_location, dropoff_location,
      bounty_type, bounty_amount,
      expiresAt,
    ]
  );

  const quest = rows[0];

  // Increment user's posted count
  await query(
    'UPDATE users SET quests_posted = quests_posted + 1 WHERE id = $1',
    [req.user.id]
  );

  // Real-time broadcast to all radar watchers
  emitQuestCreated({
    ...quest,
    requester: {
      id:     req.user.id,
      name:   req.user.name,
      branch: req.user.branch,
      hostel: req.user.hostel,
      tier:   req.user.tier,
    },
  });

  return sendSuccess(res, quest, 201);
});

// ── POST /quests/:id/cancel ────────────────────────────────────────────────────
const cancelQuest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const result = await withTransaction(async (client) => {
    // Load quest with lock
    const { rows } = await client.query(
      'SELECT * FROM quests WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (!rows.length) throw new AppError('Quest not found', 404, 'QUEST_NOT_FOUND');
    const quest = rows[0];

    // Only requester or admin can cancel
    if (quest.requester_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Only the requester can cancel this quest', 403, 'FORBIDDEN');
    }

    if (['completed', 'cancelled'].includes(quest.status)) {
      throw new AppError(
        `Cannot cancel a quest with status: ${quest.status}`,
        400,
        'INVALID_TRANSITION'
      );
    }

    const { rows: updated } = await client.query(
      `UPDATE quests
          SET status = 'cancelled', cancel_reason = $2
        WHERE id = $1
        RETURNING *`,
      [id, reason ?? null]
    );

    return updated[0];
  });

  emitQuestStatusChanged({ questId: id, status: 'cancelled' });
  return sendSuccess(res, result);
});

// ── POST /quests/:id/pickup ────────────────────────────────────────────────────
const pickupQuest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { rows: questRows } = await query(
    'SELECT * FROM quests WHERE id = $1',
    [id]
  );
  if (!questRows.length) throw new AppError('Quest not found', 404, 'QUEST_NOT_FOUND');

  const quest = questRows[0];
  if (quest.courier_id !== req.user.id) {
    throw new AppError('Only the assigned courier can mark pickup', 403, 'FORBIDDEN');
  }
  if (quest.status !== 'claimed') {
    throw new AppError('Quest must be in claimed status to pick up', 400, 'INVALID_TRANSITION');
  }

  const { rows } = await query(
    `UPDATE quests SET status = 'in_transit'
      WHERE id = $1 RETURNING *`,
    [id]
  );

  emitQuestStatusChanged({ questId: id, status: 'in_transit' });
  return sendSuccess(res, rows[0]);
});

// ── POST /quests/:id/complete ──────────────────────────────────────────────────
const completeQuest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await withTransaction(async (client) => {
    const { rows } = await client.query(
      'SELECT * FROM quests WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (!rows.length) throw new AppError('Quest not found', 404, 'QUEST_NOT_FOUND');

    const quest = rows[0];

    if (quest.courier_id !== req.user.id) {
      throw new AppError('Only the assigned courier can complete this quest', 403, 'FORBIDDEN');
    }
    if (quest.status !== 'in_transit') {
      throw new AppError(
        'Quest must be in_transit to mark complete',
        400,
        'INVALID_TRANSITION'
      );
    }

    // 1. Mark quest completed
    await client.query(
      "UPDATE quests SET status = 'completed' WHERE id = $1",
      [id]
    );

    // 2. Credit QP to courier (only for QP bounties)
    if (quest.bounty_type === 'qp') {
      const { rows: courierRows } = await client.query(
        'SELECT qp_balance FROM users WHERE id = $1 FOR UPDATE',
        [quest.courier_id]
      );
      const courierBalance = courierRows[0].qp_balance;
      const newBalance     = courierBalance + quest.bounty_amount;

      await client.query(
        `UPDATE users
            SET qp_balance = $1, quests_completed = quests_completed + 1
          WHERE id = $2`,
        [newBalance, quest.courier_id]
      );

      // 3. Write transaction ledger entry
      await client.query(
        `INSERT INTO transactions
           (user_id, type, amount, balance_before, balance_after,
            quest_id, description)
         VALUES ($1,'quest_earned',$2,$3,$4,$5,$6)`,
        [
          quest.courier_id,
          quest.bounty_amount,
          courierBalance,
          newBalance,
          quest.id,
          `Quest completed: ${quest.item_description.slice(0, 60)}`,
        ]
      );

      emitQPUpdated({
        userId:     quest.courier_id,
        newBalance,
        delta:      quest.bounty_amount,
        reason:     'Quest completed',
      });
    } else {
      // Cash bounty: just increment count
      await client.query(
        'UPDATE users SET quests_completed = quests_completed + 1 WHERE id = $1',
        [quest.courier_id]
      );
    }

    return quest;
  });

  emitQuestStatusChanged({ questId: id, status: 'completed' });
  return sendSuccess(res, { questId: id, status: 'completed' });
});

module.exports = {
  getQuests,
  getMyQuests,
  getQuestById,
  createQuest,     createValidators,
  cancelQuest,
  pickupQuest,
  completeQuest,
};
