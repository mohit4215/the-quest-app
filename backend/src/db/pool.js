/**
 * db/pool.js — PostgreSQL connection pool
 *
 * Single shared Pool instance for the entire app.
 * Never create a new Pool per request — that exhausts connections instantly.
 *
 * Usage:
 *   const { query, getClient } = require('./pool');
 *
 *   // Simple query (auto-released connection)
 *   const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
 *
 *   // Manual transaction (needs explicit client)
 *   const client = await getClient();
 *   try {
 *     await client.query('BEGIN');
 *     ...
 *     await client.query('COMMIT');
 *   } catch (err) {
 *     await client.query('ROLLBACK');
 *     throw err;
 *   } finally {
 *     client.release();
 *   }
 */

'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
      }
    : {
        host:     process.env.DB_HOST     || 'localhost',
        port:     Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME     || 'quest_db',
        user:     process.env.DB_USER     || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        ssl:      false,
      },
  {
    min: Number(process.env.DB_POOL_MIN) || 2,
    max: Number(process.env.DB_POOL_MAX) || 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  }
);

// Surface connection errors immediately instead of silently swallowing them
pool.on('error', (err) => {
  console.error('[DB Pool] Unexpected idle client error:', err.message);
  process.exit(1);
});

// Lightweight wrapper — mirrors the pg Pool API but lets us add
// query logging or tracing in one place later.
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const ms = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[DB] ${ms}ms | rows:${result.rowCount} | ${text.slice(0, 80)}`);
  }
  return result;
}

async function getClient() {
  return pool.connect();
}

/**
 * withTransaction — convenience helper that wraps a callback in BEGIN/COMMIT/ROLLBACK.
 *
 * @param {(client: import('pg').PoolClient) => Promise<T>} fn
 * @returns {Promise<T>}
 *
 * Example:
 *   const result = await withTransaction(async (client) => {
 *     await client.query('UPDATE ...');
 *     await client.query('INSERT ...');
 *     return { ok: true };
 *   });
 */
async function withTransaction(fn) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { query, getClient, withTransaction, pool };
