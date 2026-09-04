/**
 * controllers/community.controller.js
 *
 * GET  /community/threads              — paginated thread list (with filters)
 * POST /community/threads              — create new thread
 * GET  /community/threads/:id          — single thread + replies
 * POST /community/threads/:id/replies  — post a reply
 * POST /community/threads/:id/upvote   — toggle upvote on a thread
 * POST /community/replies/:id/upvote   — toggle upvote on a reply
 * POST /community/replies/:id/accept   — mark reply as best answer (thread author only)
 * GET  /community/seniors              — list of senior users (role='senior')
 */

'use strict';

const { body, query: qv } = require('express-validator');
const { query, withTransaction } = require('../db/pool');
const AppError             = require('../utils/AppError');
const asyncHandler         = require('../utils/asyncHandler');
const { sendSuccess }      = require('../utils/response');
const {
  emitThreadCreated,
  emitReplyCreated,
  emitQPUpdated,
} = require('../socket');

// ── Validators ─────────────────────────────────────────────────────────────────
const createThreadValidators = [
  body('title')
    .trim().notEmpty().isLength({ min: 10, max: 200 })
    .withMessage('Title must be 10–200 characters'),
  body('body')
    .trim().notEmpty().isLength({ min: 20, max: 5000 })
    .withMessage('Body must be 20–5000 characters'),
  body('tag')
    .isIn(['placements','dsa','academics','internships',
           'gate','projects','backlog','campus_life','general'])
    .withMessage('Invalid tag'),
];

const createReplyValidators = [
  body('body')
    .trim().notEmpty().isLength({ min: 5, max: 2000 })
    .withMessage('Reply must be 5–2000 characters'),
  body('parent_id').optional().isUUID(),
];

// ── Shared author fragment ──────────────────────────────────────────────────────
const AUTHOR_JSON = `
  json_build_object(
    'id',     u.id,
    'name',   u.name,
    'branch', u.branch,
    'year',   u.year,
    'tier',   u.tier,
    'role',   u.role
  ) AS author
`;

// ── GET /community/threads ─────────────────────────────────────────────────────
const getThreads = asyncHandler(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const limit  = Math.min(50, parseInt(req.query.limit) || 20);
  const offset = (page - 1) * limit;
  const tag    = req.query.tag   || null;
  const sort   = req.query.sort  || 'recent'; // 'recent' | 'top' | 'unanswered'
  const search = req.query.search?.trim() || null;

  const validTags = ['placements','dsa','academics','internships',
                     'gate','projects','backlog','campus_life','general'];

  // Build dynamic WHERE clauses
  const conditions  = ['t.is_locked = FALSE OR t.is_pinned = TRUE'];
  const params      = [];
  let   paramIndex  = 1;

  if (tag && validTags.includes(tag)) {
    conditions.push(`t.tag = $${paramIndex++}`);
    params.push(tag);
  }
  if (sort === 'unanswered') {
    conditions.push('t.is_answered = FALSE');
  }
  if (search) {
    conditions.push(
      `(t.title || ' ' || t.body) ILIKE $${paramIndex++}`
    );
    params.push(`%${search}%`);
  }

  const whereSQL = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const orderSQL = sort === 'top'
    ? 'ORDER BY t.is_pinned DESC, t.upvote_count DESC, t.created_at DESC'
    : 'ORDER BY t.is_pinned DESC, t.created_at DESC';

  const { rows } = await query(
    `SELECT
       t.id, t.title, t.body, t.tag,
       t.upvote_count, t.view_count, t.reply_count,
       t.is_answered, t.is_pinned,
       t.created_at, t.updated_at,
       ${AUTHOR_JSON}
     FROM community_threads t
     JOIN users u ON u.id = t.author_id
     ${whereSQL}
     ${orderSQL}
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset]
  );

  const { rows: countRows } = await query(
    `SELECT COUNT(*) FROM community_threads t ${whereSQL}`,
    params
  );

  return sendSuccess(res, rows, 200, {
    page,
    limit,
    total: parseInt(countRows[0].count),
    hasMore: offset + rows.length < parseInt(countRows[0].count),
  });
});

// ── GET /community/threads/:id ─────────────────────────────────────────────────
const getThreadById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Increment view count (fire-and-forget — don't await)
  query('UPDATE community_threads SET view_count = view_count + 1 WHERE id = $1', [id])
    .catch(() => {});

  const { rows: threadRows } = await query(
    `SELECT
       t.id, t.title, t.body, t.tag,
       t.upvote_count, t.view_count, t.reply_count,
       t.is_answered, t.is_pinned, t.is_locked,
       t.created_at, t.updated_at,
       ${AUTHOR_JSON}
     FROM community_threads t
     JOIN users u ON u.id = t.author_id
     WHERE t.id = $1`,
    [id]
  );

  if (!threadRows.length) {
    throw new AppError('Thread not found', 404, 'THREAD_NOT_FOUND');
  }

  // Fetch replies (one level of nesting — top-level + children grouped)
  const { rows: replyRows } = await query(
    `SELECT
       r.id, r.thread_id, r.parent_id, r.body,
       r.upvote_count, r.is_accepted,
       r.created_at, r.updated_at,
       json_build_object(
         'id',   u.id,
         'name', u.name,
         'tier', u.tier,
         'role', u.role
       ) AS author
     FROM thread_replies r
     JOIN users u ON u.id = r.author_id
     WHERE r.thread_id = $1
     ORDER BY r.is_accepted DESC, r.upvote_count DESC, r.created_at ASC`,
    [id]
  );

  // Nest replies: build parent → children map
  const topLevel = [];
  const byId     = {};

  for (const r of replyRows) {
    byId[r.id] = { ...r, children: [] };
  }
  for (const r of replyRows) {
    if (r.parent_id && byId[r.parent_id]) {
      byId[r.parent_id].children.push(byId[r.id]);
    } else {
      topLevel.push(byId[r.id]);
    }
  }

  return sendSuccess(res, { thread: threadRows[0], replies: topLevel });
});

// ── POST /community/threads ────────────────────────────────────────────────────
const createThread = asyncHandler(async (req, res) => {
  const { title, body: bodyText, tag } = req.body;

  const { rows } = await query(
    `INSERT INTO community_threads (author_id, title, body, tag)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, body, tag, upvote_count, reply_count,
               is_answered, created_at`,
    [req.user.id, title, bodyText, tag]
  );

  const thread = {
    ...rows[0],
    author: {
      id:     req.user.id,
      name:   req.user.name,
      branch: req.user.branch,
      tier:   req.user.tier,
      role:   req.user.role,
    },
  };

  // Real-time broadcast to forum room
  emitThreadCreated(thread);

  return sendSuccess(res, thread, 201);
});

// ── POST /community/threads/:id/replies ────────────────────────────────────────
const createReply = asyncHandler(async (req, res) => {
  const { id: threadId } = req.params;
  const { body: bodyText, parent_id } = req.body;

  // Verify thread exists and is not locked
  const { rows: threadRows } = await query(
    'SELECT id, is_locked FROM community_threads WHERE id = $1',
    [threadId]
  );
  if (!threadRows.length) {
    throw new AppError('Thread not found', 404, 'THREAD_NOT_FOUND');
  }
  if (threadRows[0].is_locked) {
    throw new AppError('This thread is locked', 403, 'THREAD_LOCKED');
  }

  // Validate parent_id if provided
  if (parent_id) {
    const { rows: parentRows } = await query(
      'SELECT id FROM thread_replies WHERE id = $1 AND thread_id = $2',
      [parent_id, threadId]
    );
    if (!parentRows.length) {
      throw new AppError('Parent reply not found in this thread', 400, 'INVALID_PARENT');
    }
  }

  const { rows } = await query(
    `INSERT INTO thread_replies (thread_id, author_id, parent_id, body)
     VALUES ($1, $2, $3, $4)
     RETURNING id, thread_id, parent_id, body, upvote_count,
               is_accepted, created_at`,
    [threadId, req.user.id, parent_id ?? null, bodyText]
  );

  const reply = {
    ...rows[0],
    author: {
      id:   req.user.id,
      name: req.user.name,
      tier: req.user.tier,
      role: req.user.role,
    },
  };

  emitReplyCreated({ threadId, reply });

  return sendSuccess(res, reply, 201);
});

// ── POST /community/threads/:id/upvote ────────────────────────────────────────
const upvoteThread = asyncHandler(async (req, res) => {
  const { id: threadId } = req.params;
  const userId = req.user.id;

  // Verify thread exists
  const { rows: threadRows } = await query(
    'SELECT id, upvote_count, bonus_awarded, author_id FROM community_threads WHERE id = $1',
    [threadId]
  );
  if (!threadRows.length) throw new AppError('Thread not found', 404, 'THREAD_NOT_FOUND');

  const thread = threadRows[0];

  // Check existing upvote
  const { rows: existing } = await query(
    'SELECT user_id FROM thread_upvotes WHERE user_id = $1 AND thread_id = $2',
    [userId, threadId]
  );

  let action;
  if (existing.length) {
    // Toggle off
    await query(
      'DELETE FROM thread_upvotes WHERE user_id = $1 AND thread_id = $2',
      [userId, threadId]
    );
    action = 'removed';
  } else {
    // Toggle on
    await query(
      'INSERT INTO thread_upvotes (user_id, thread_id) VALUES ($1, $2)',
      [userId, threadId]
    );
    action = 'added';

    // ── QP bonus: award 25 QP to thread author when first hitting 10 upvotes ──
    const newCount = thread.upvote_count + 1;
    if (newCount >= 10 && !thread.bonus_awarded && thread.author_id !== userId) {
      await withTransaction(async (client) => {
        const { rows: authorRows } = await client.query(
          'SELECT qp_balance FROM users WHERE id = $1 FOR UPDATE',
          [thread.author_id]
        );
        const bal = authorRows[0].qp_balance;
        const newBal = bal + 25;

        await client.query(
          'UPDATE users SET qp_balance = $1 WHERE id = $2',
          [newBal, thread.author_id]
        );
        await client.query(
          `INSERT INTO transactions
             (user_id, type, amount, balance_before, balance_after, description)
           VALUES ($1,'senior_bonus',25,$2,$3,$4)`,
          [thread.author_id, bal, newBal, 'Thread reached 10 upvotes bonus']
        );
        await client.query(
          'UPDATE community_threads SET bonus_awarded = TRUE WHERE id = $1',
          [threadId]
        );

        emitQPUpdated({
          userId:     thread.author_id,
          newBalance: newBal,
          delta:      25,
          reason:     'Your thread reached 10 upvotes!',
        });
      });
    }
  }

  // Fetch fresh count
  const { rows: fresh } = await query(
    'SELECT upvote_count FROM community_threads WHERE id = $1',
    [threadId]
  );

  return sendSuccess(res, {
    action,
    thread_id:    threadId,
    upvote_count: fresh[0].upvote_count,
  });
});

// ── POST /community/replies/:id/upvote ────────────────────────────────────────
const upvoteReply = asyncHandler(async (req, res) => {
  const { id: replyId } = req.params;
  const userId = req.user.id;

  const { rows: replyRows } = await query(
    'SELECT id FROM thread_replies WHERE id = $1',
    [replyId]
  );
  if (!replyRows.length) throw new AppError('Reply not found', 404, 'REPLY_NOT_FOUND');

  const { rows: existing } = await query(
    'SELECT user_id FROM thread_upvotes WHERE user_id = $1 AND reply_id = $2',
    [userId, replyId]
  );

  let action;
  if (existing.length) {
    await query(
      'DELETE FROM thread_upvotes WHERE user_id = $1 AND reply_id = $2',
      [userId, replyId]
    );
    action = 'removed';
  } else {
    await query(
      'INSERT INTO thread_upvotes (user_id, reply_id) VALUES ($1, $2)',
      [userId, replyId]
    );
    action = 'added';
  }

  const { rows: fresh } = await query(
    'SELECT upvote_count FROM thread_replies WHERE id = $1',
    [replyId]
  );

  return sendSuccess(res, {
    action,
    reply_id:     replyId,
    upvote_count: fresh[0].upvote_count,
  });
});

// ── POST /community/replies/:id/accept ────────────────────────────────────────
const acceptReply = asyncHandler(async (req, res) => {
  const { id: replyId } = req.params;

  const { rows } = await query(
    `SELECT r.id, r.thread_id, r.is_accepted, t.author_id AS thread_author_id
       FROM thread_replies r
       JOIN community_threads t ON t.id = r.thread_id
      WHERE r.id = $1`,
    [replyId]
  );
  if (!rows.length) throw new AppError('Reply not found', 404, 'REPLY_NOT_FOUND');

  const reply = rows[0];

  if (reply.thread_author_id !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Only the thread author can accept an answer', 403, 'FORBIDDEN');
  }

  // Unmark any previously accepted reply for this thread
  await query(
    `UPDATE thread_replies SET is_accepted = FALSE
      WHERE thread_id = $1 AND is_accepted = TRUE`,
    [reply.thread_id]
  );

  // Mark this one accepted and mark thread as answered
  await query(
    'UPDATE thread_replies SET is_accepted = TRUE WHERE id = $1',
    [replyId]
  );
  await query(
    'UPDATE community_threads SET is_answered = TRUE WHERE id = $1',
    [reply.thread_id]
  );

  return sendSuccess(res, { reply_id: replyId, accepted: true });
});

// ── GET /community/seniors ─────────────────────────────────────────────────────
const getSeniors = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT id, name, branch, year, tier,
            quests_completed,
            (SELECT COUNT(*) FROM thread_replies WHERE author_id = u.id)::int AS reply_count,
            last_seen_at,
            (last_seen_at > NOW() - INTERVAL '15 minutes') AS is_online
       FROM users u
      WHERE role = 'senior'
        AND is_active = TRUE
      ORDER BY is_online DESC, tier DESC, reply_count DESC`
  );

  return sendSuccess(res, rows);
});

module.exports = {
  getThreads,
  getThreadById,
  createThread,  createThreadValidators,
  createReply,   createReplyValidators,
  upvoteThread,
  upvoteReply,
  acceptReply,
  getSeniors,
};
