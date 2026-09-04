/**
 * socket/index.js — Socket.io server + room management
 *
 * Room strategy:
 *   "quests:open"          — all connected clients watching the live radar
 *   "quest:<id>"           — per-quest room (requester + claimed courier)
 *   "user:<id>"            — private channel per authenticated user
 *   "forum"                — community thread updates
 *
 * Events emitted BY server:
 *   quest:created          — new quest posted  { quest }
 *   quest:claimed          — quest claimed     { questId, courierId, courierName }
 *   quest:status_changed   — any status update { questId, status, updatedAt }
 *   quest:cancelled        — quest cancelled   { questId }
 *   user:qp_updated        — QP balance change { userId, newBalance, delta, reason }
 *   forum:thread_created   — new Q&A thread    { thread }
 *   forum:reply_created    — new reply         { threadId, reply }
 *   system:ping            — keepalive         { ts }
 *
 * Events listened for FROM client:
 *   join:quest             — { questId }  — join per-quest room
 *   leave:quest            — { questId }  — leave per-quest room
 *   join:forum             — join forum room
 */

'use strict';

const { Server } = require('socket.io');
const jwt        = require('jsonwebtoken');

/** @type {import('socket.io').Server | null} */
let io = null;

/**
 * Initialise Socket.io and attach it to an existing HTTP server.
 * Call once from server.js after createServer().
 *
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
function initSocket(httpServer) {
  const corsOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: corsOrigins.length ? corsOrigins : '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Prefer WebSocket, fall back to polling
    transports: ['websocket', 'polling'],
    pingInterval: 25_000,
    pingTimeout:  60_000,
  });

  // ── Auth middleware (optional token) ──────────────────────────────────────
  // Unauthenticated clients can still receive public broadcasts (radar).
  // Authenticated clients also join their private user:<id> room.
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.data.userId   = payload.sub;
        socket.data.userName = payload.name;
        socket.data.role     = payload.role;
      } catch {
        // Token is invalid/expired — treat as anonymous
        socket.data.userId = null;
      }
    }
    next();
  });

  // ── Connection handler ────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const uid = socket.data.userId;

    // All clients join the open quests radar room
    socket.join('quests:open');

    // Authenticated clients get a private user room
    if (uid) {
      socket.join(`user:${uid}`);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[WS] connect  id=${socket.id} user=${uid ?? 'anon'} rooms=${[...socket.rooms].join(',')}`
      );
    }

    // ── Client-initiated room joins ─────────────────────────────────────────
    socket.on('join:quest', ({ questId } = {}) => {
      if (questId) socket.join(`quest:${questId}`);
    });

    socket.on('leave:quest', ({ questId } = {}) => {
      if (questId) socket.leave(`quest:${questId}`);
    });

    socket.on('join:forum', () => {
      socket.join('forum');
    });

    // ── Keepalive ───────────────────────────────────────────────────────────
    socket.on('ping', () => {
      socket.emit('system:ping', { ts: Date.now() });
    });

    socket.on('disconnect', (reason) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[WS] disconnect id=${socket.id} reason=${reason}`);
      }
    });
  });

  // ── Heartbeat broadcast every 30 s ────────────────────────────────────────
  setInterval(() => {
    io.to('quests:open').emit('system:ping', { ts: Date.now() });
  }, 30_000);

  console.log('[WS] Socket.io server initialised');
  return io;
}

/**
 * Get the initialised io instance.
 * Throws if called before initSocket().
 * @returns {import('socket.io').Server}
 */
function getIO() {
  if (!io) throw new Error('Socket.io has not been initialised. Call initSocket() first.');
  return io;
}

// ── Typed emit helpers ────────────────────────────────────────────────────────
// Import these in controllers instead of calling getIO() directly.

/** Broadcast a newly created quest to all radar watchers */
function emitQuestCreated(quest) {
  getIO().to('quests:open').emit('quest:created', { quest });
}

/**
 * Broadcast that a quest has been claimed.
 * Also notifies the per-quest room and removes it from open radar on clients.
 */
function emitQuestClaimed({ questId, courierId, courierName, bounty }) {
  const io = getIO();
  // Tell the radar to remove this card
  io.to('quests:open').emit('quest:claimed', { questId, courierId, courierName, bounty });
  // Tell anyone watching this quest specifically
  io.to(`quest:${questId}`).emit('quest:status_changed', {
    questId,
    status: 'claimed',
    courierId,
    courierName,
    updatedAt: new Date().toISOString(),
  });
}

/** Generic status change broadcast */
function emitQuestStatusChanged({ questId, status, extra = {} }) {
  const io = getIO();
  const payload = { questId, status, updatedAt: new Date().toISOString(), ...extra };
  io.to('quests:open').emit('quest:status_changed', payload);
  io.to(`quest:${questId}`).emit('quest:status_changed', payload);
}

/** Notify a specific user their QP balance changed */
function emitQPUpdated({ userId, newBalance, delta, reason }) {
  getIO()
    .to(`user:${userId}`)
    .emit('user:qp_updated', { userId, newBalance, delta, reason });
}

/** Broadcast a new forum thread */
function emitThreadCreated(thread) {
  getIO().to('forum').emit('forum:thread_created', { thread });
}

/** Broadcast a new reply to a thread's room */
function emitReplyCreated({ threadId, reply }) {
  getIO().to(`quest:thread:${threadId}`).emit('forum:reply_created', { threadId, reply });
}

module.exports = {
  initSocket,
  getIO,
  emitQuestCreated,
  emitQuestClaimed,
  emitQuestStatusChanged,
  emitQPUpdated,
  emitThreadCreated,
  emitReplyCreated,
};
