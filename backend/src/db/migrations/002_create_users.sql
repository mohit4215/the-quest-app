-- ── 002_create_users.sql ──────────────────────────────────────────────────────
-- Core user accounts. Stores auth info, gamification state, and QP balance.
-- QP balance is an INTEGER cents-equivalent (whole points only).

CREATE TYPE user_role AS ENUM ('student', 'senior', 'admin');

CREATE TYPE gamification_tier AS ENUM (
  'freshman_quester',   --    0–199  QP
  'campus_scout',       --  200–499  QP
  'silver_quester',     --  500–999  QP
  'gold_quester',       -- 1000–1999 QP
  'quest_master',       -- 2000–3999 QP
  'campus_legend'       -- 4000+     QP
);

CREATE TABLE users (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT            NOT NULL,
  email             TEXT            NOT NULL UNIQUE,
  password_hash     TEXT            NOT NULL,

  -- Profile
  roll_number       TEXT            UNIQUE,
  branch            TEXT,                        -- e.g. 'CSE', 'ECE', 'IT'
  year              SMALLINT        CHECK (year BETWEEN 1 AND 5),
  hostel            TEXT,                        -- e.g. 'H-1', 'H-2', 'Girls Hostel'
  room_number       TEXT,

  -- Auth
  role              user_role       NOT NULL DEFAULT 'student',
  is_verified       BOOLEAN         NOT NULL DEFAULT FALSE,
  is_active         BOOLEAN         NOT NULL DEFAULT TRUE,
  refresh_token     TEXT,                        -- stored hashed

  -- Gamification
  qp_balance        INTEGER         NOT NULL DEFAULT 0 CHECK (qp_balance >= 0),
  tier              gamification_tier NOT NULL DEFAULT 'freshman_quester',
  total_qp_earned   INTEGER         NOT NULL DEFAULT 0,
  quests_completed  INTEGER         NOT NULL DEFAULT 0,
  quests_posted     INTEGER         NOT NULL DEFAULT 0,

  -- Timestamps
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  last_seen_at      TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_users_email        ON users (email);
CREATE INDEX idx_users_role         ON users (role);
CREATE INDEX idx_users_tier         ON users (tier);
CREATE INDEX idx_users_qp_balance   ON users (qp_balance DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Tier auto-calculation function ────────────────────────────────────────────
-- Called after any QP balance change to keep tier in sync.

CREATE OR REPLACE FUNCTION recalculate_tier(qp INTEGER)
RETURNS gamification_tier AS $$
BEGIN
  RETURN CASE
    WHEN qp >= 4000 THEN 'campus_legend'::gamification_tier
    WHEN qp >= 2000 THEN 'quest_master'::gamification_tier
    WHEN qp >= 1000 THEN 'gold_quester'::gamification_tier
    WHEN qp >= 500  THEN 'silver_quester'::gamification_tier
    WHEN qp >= 200  THEN 'campus_scout'::gamification_tier
    ELSE                  'freshman_quester'::gamification_tier
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger: recalculate tier whenever qp_balance changes
CREATE OR REPLACE FUNCTION trg_sync_tier_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qp_balance IS DISTINCT FROM OLD.qp_balance THEN
    NEW.tier = recalculate_tier(NEW.qp_balance);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_tier
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trg_sync_tier_fn();
