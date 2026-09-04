/**
 * server.js — HTTP + WebSocket server entry point
 *
 * Start order:
 *   1. Create HTTP server wrapping the Express app
 *   2. Attach Socket.io to the HTTP server
 *   3. Verify database connectivity
 *   4. Listen on PORT
 *
 * Graceful shutdown:
 *   SIGTERM / SIGINT → stop accepting new connections,
 *   drain existing ones, close DB pool, then exit.
 *
 * Usage:
 *   node src/server.js          (production)
 *   nodemon src/server.js       (development via npm run dev)
 */

'use strict';

require('dotenv').config();

const http        = require('http');
const app         = require('./app');
const { initSocket } = require('./socket');
const { pool }    = require('./db/pool');

const PORT = Number(process.env.PORT) || 4000;

// ── Create HTTP server ────────────────────────────────────────────────────────
const httpServer = http.createServer(app);

// ── Attach Socket.io ──────────────────────────────────────────────────────────
const io = initSocket(httpServer);    // io available if needed elsewhere via getIO()

// ── Verify DB connection before accepting traffic ─────────────────────────────
async function verifyDB() {
  const client = await pool.connect();
  const { rows } = await client.query('SELECT NOW() AS now, version() AS pg_version');
  client.release();
  console.log(`[DB] Connected — PostgreSQL ${rows[0].pg_version.split(' ')[1]}`);
  console.log(`[DB] Server time: ${rows[0].now}`);
}

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await verifyDB();

    httpServer.listen(PORT, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════════════╗');
      console.log('║           Quest Backend — AKGEC               ║');
      console.log('╠═══════════════════════════════════════════════╣');
      console.log(`║  HTTP    → http://localhost:${PORT}               ║`);
      console.log(`║  WS      → ws://localhost:${PORT}                 ║`);
      console.log(`║  Health  → http://localhost:${PORT}/health         ║`);
      console.log(`║  ENV     → ${(process.env.NODE_ENV || 'development').padEnd(10)}                   ║`);
      console.log('╚═══════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (err) {
    console.error('[FATAL] Server failed to start:', err.message);
    process.exit(1);
  }
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────
let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n[Server] ${signal} received — graceful shutdown started`);

  // 1. Stop accepting new HTTP connections
  httpServer.close(async () => {
    console.log('[Server] HTTP server closed');

    // 2. Close Socket.io (disconnect all clients cleanly)
    io.close(() => {
      console.log('[WS] Socket.io closed');
    });

    // 3. Drain and close PG pool
    try {
      await pool.end();
      console.log('[DB] Connection pool closed');
    } catch (err) {
      console.error('[DB] Error closing pool:', err.message);
    }

    console.log('[Server] Shutdown complete');
    process.exit(0);
  });

  // Force exit after 10 s if graceful shutdown hangs
  setTimeout(() => {
    console.error('[Server] Forced exit after 10s timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// Catch unhandled promise rejections (log but don't crash in dev)
process.on('unhandledRejection', (reason) => {
  console.error('[UnhandledRejection]', reason);
  if (process.env.NODE_ENV === 'production') shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error('[UncaughtException]', err);
  shutdown('uncaughtException');
});

start();
