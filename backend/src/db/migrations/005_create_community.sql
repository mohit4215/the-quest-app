-- ── 005_create_community.sql ──────────────────────────────────────────────────
-- "Talk to a Senior" forum: threads + nested replies.
-- Uses adjacency list (parent_id self-reference) for one level of nesting.
-- Deep nesting is unlikely in a campus Q&A context; keep it simple.

CREATE TYPE thread_tag AS ENUM (
  'placements', 'dsa', 'academics', 'internships',
  'gate', 'projects', 'backlog', 'campus_life', 'general'
);

CREATE TABLE community_threads (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  title           TEXT          NOT NULL,
  body            TEXT          NOT NULL,
  tag             thread_tag    NOT NULL DEFAULT 'general',

  -- Engagement
  upvote_count    INTEGER       NOT NULL DEFAULT 0 CHECK (upvote_count >= 0),
  view_count      INTEGER       NOT NULL DEFAULT 0,
  reply_count     INTEGER       NOT NULL DEFAULT 0 CHECK (reply_count >= 0),
  is_answered     BOOLEAN       NOT NULL DEFAULT FALSE,
  is_pinned       BOOLEAN       NOT NULL DEFAULT FALSE,
  is_locked       BOOLEAN       NOT NULL DEFAULT FALSE,

  -- QP bonus tracking (25 QP if question hits 10+ upvotes)
  bonus_awarded   BOOLEAN       NOT NULL DEFAULT FALSE,

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_threads_author_id   ON community_threads (author_id);
CREATE INDEX idx_threads_tag         ON community_threads (tag);
CREATE INDEX idx_threads_created     ON community_threads (created_at DESC);
CREATE INDEX idx_threads_upvotes     ON community_threads (upvote_count DESC);
-- GIN index on title+body for pg_trgm full-text search
CREATE INDEX idx_threads_fts ON community_threads
  USING GIN ((title || ' ' || body) gin_trgm_ops);

CREATE TRIGGER trg_threads_updated_at
  BEFORE UPDATE ON community_threads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Thread replies ─────────────────────────────────────────────────────────────

CREATE TABLE thread_replies (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id       UUID          NOT NULL REFERENCES community_threads(id) ON DELETE CASCADE,
  author_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id       UUID          REFERENCES thread_replies(id) ON DELETE CASCADE,

  body            TEXT          NOT NULL,
  upvote_count    INTEGER       NOT NULL DEFAULT 0 CHECK (upvote_count >= 0),
  is_accepted     BOOLEAN       NOT NULL DEFAULT FALSE,  -- "Best Answer" mark

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_replies_thread_id   ON thread_replies (thread_id, created_at ASC);
CREATE INDEX idx_replies_author_id   ON thread_replies (author_id);
CREATE INDEX idx_replies_parent_id   ON thread_replies (parent_id);

CREATE TRIGGER trg_replies_updated_at
  BEFORE UPDATE ON thread_replies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-increment reply_count on thread when reply inserted/deleted
CREATE OR REPLACE FUNCTION sync_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_threads
      SET reply_count = reply_count + 1
      WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_threads
      SET reply_count = GREATEST(0, reply_count - 1)
      WHERE id = OLD.thread_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_reply_count
  AFTER INSERT OR DELETE ON thread_replies
  FOR EACH ROW EXECUTE FUNCTION sync_reply_count();

-- ── Thread upvotes (unique per user per thread) ────────────────────────────────

CREATE TABLE thread_upvotes (
  user_id     UUID    NOT NULL REFERENCES users(id)              ON DELETE CASCADE,
  thread_id   UUID    REFERENCES community_threads(id)           ON DELETE CASCADE,
  reply_id    UUID    REFERENCES thread_replies(id)              ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Exactly one of thread_id or reply_id must be set
  CONSTRAINT thread_upvotes_target_check CHECK (
    (thread_id IS NOT NULL AND reply_id IS NULL) OR
    (thread_id IS NULL     AND reply_id IS NOT NULL)
  ),
  CONSTRAINT thread_upvotes_unique UNIQUE (user_id, thread_id, reply_id)
);

-- Sync upvote_count on insert/delete from thread_upvotes
CREATE OR REPLACE FUNCTION sync_upvote_count()
RETURNS TRIGGER AS $$
DECLARE
  delta INTEGER := CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE -1 END;
  rec   RECORD  := CASE WHEN TG_OP = 'INSERT' THEN NEW ELSE OLD END;
BEGIN
  IF rec.thread_id IS NOT NULL THEN
    UPDATE community_threads
      SET upvote_count = GREATEST(0, upvote_count + delta)
      WHERE id = rec.thread_id;
  ELSE
    UPDATE thread_replies
      SET upvote_count = GREATEST(0, upvote_count + delta)
      WHERE id = rec.reply_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_upvote_count
  AFTER INSERT OR DELETE ON thread_upvotes
  FOR EACH ROW EXECUTE FUNCTION sync_upvote_count();

-- ── Perks / Partner shops ──────────────────────────────────────────────────────
-- Campus shop perks redeemable with QP.

CREATE TABLE perks (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name       TEXT        NOT NULL,
  emoji           TEXT        NOT NULL DEFAULT '🏪',
  offer_text      TEXT        NOT NULL,
  qp_cost         INTEGER     NOT NULL CHECK (qp_cost > 0),
  category        TEXT        NOT NULL DEFAULT 'general',
  is_available    BOOLEAN     NOT NULL DEFAULT TRUE,
  valid_until     TIMESTAMPTZ,
  total_redeemed  INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE perk_redemptions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  perk_id     UUID        NOT NULL REFERENCES perks(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  txn_id      UUID        REFERENCES transactions(id)  ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  receipt_code TEXT       NOT NULL UNIQUE DEFAULT UPPER(SUBSTR(gen_random_uuid()::TEXT, 1, 8))
);

CREATE INDEX idx_perk_redemptions_user   ON perk_redemptions (user_id, redeemed_at DESC);
CREATE INDEX idx_perk_redemptions_perk   ON perk_redemptions (perk_id);
