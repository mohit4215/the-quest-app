-- ── 001_create_extensions.sql ─────────────────────────────────────────────────
-- Enable UUID generation natively in PostgreSQL
-- Must run before any table that uses gen_random_uuid()

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- for future full-text search on threads
