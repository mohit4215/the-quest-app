/**
 * db/migrate.js — Run all SQL migration files in order.
 *
 * Usage:  node src/db/migrate.js
 *
 * Migrations are idempotent: uses a migrations_log table to track
 * which files have already run. Safe to re-run at any time.
 */

'use strict';

require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { pool } = require('./pool');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function migrate() {
  const client = await pool.connect();
  try {
    // Ensure the tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations_log (
        id         SERIAL      PRIMARY KEY,
        filename   TEXT        NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Load already-applied filenames
    const { rows: applied } = await client.query(
      'SELECT filename FROM migrations_log ORDER BY id'
    );
    const appliedSet = new Set(applied.map((r) => r.filename));

    // Read migration files sorted numerically
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    let ran = 0;
    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`  ✓ skip  ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO migrations_log (filename) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`  ✔ ran   ${file}`);
        ran++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ✖ fail  ${file}: ${err.message}`);
        throw err;
      }
    }

    console.log(`\nMigrations complete. ${ran} file(s) applied.`);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
