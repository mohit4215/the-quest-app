-- ── 003_create_quests.sql ─────────────────────────────────────────────────────
-- Central quest/errand table.
-- The claim race condition is prevented at the DB level via:
--   SELECT ... FOR UPDATE SKIP LOCKED  (see claim controller)
-- The status column uses an enum with a strict forward-only progression.

CREATE TYPE quest_status AS ENUM (
  'open',        -- posted, waiting for courier
  'claimed',     -- courier assigned, not yet picked up
  'in_transit',  -- courier has picked up the item
  'completed',   -- delivered, QP settled
  'cancelled'    -- requester cancelled before claim
);

CREATE TYPE bounty_type AS ENUM ('qp', 'cash');

CREATE TABLE quests (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties
  requester_id      UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  courier_id        UUID          REFERENCES users(id) ON DELETE SET NULL,

  -- Item details
  item_description  TEXT          NOT NULL,
  notes             TEXT,

  -- Locations
  pickup_location   TEXT          NOT NULL,    -- e.g. 'Sachi Street — Tea Stall'
  dropoff_location  TEXT          NOT NULL,    -- e.g. 'Hostel H-1, Room 214'
  dropoff_lat       NUMERIC(9,6), -- optional GPS
  dropoff_lng       NUMERIC(9,6),

  -- Bounty
  bounty_type       bounty_type   NOT NULL DEFAULT 'qp',
  bounty_amount     INTEGER       NOT NULL CHECK (bounty_amount > 0),

  -- State machine
  status            quest_status  NOT NULL DEFAULT 'open',

  -- Timing
  expires_at        TIMESTAMPTZ,               -- auto-cancel if still open past this
  claimed_at        TIMESTAMPTZ,
  picked_up_at      TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,

  -- Metadata
  cancel_reason     TEXT,
  rating            SMALLINT      CHECK (rating BETWEEN 1 AND 5),
  rated_by_requester BOOLEAN      NOT NULL DEFAULT FALSE,

  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quests_status          ON quests (status);
CREATE INDEX idx_quests_requester_id    ON quests (requester_id);
CREATE INDEX idx_quests_courier_id      ON quests (courier_id);
CREATE INDEX idx_quests_status_created  ON quests (status, created_at DESC);
-- Partial index — only open quests (most queried subset for radar feed)
CREATE INDEX idx_quests_open            ON quests (created_at DESC)
  WHERE status = 'open';

CREATE TRIGGER trg_quests_updated_at
  BEFORE UPDATE ON quests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Status transition guard ────────────────────────────────────────────────────
-- Prevents illegal backwards/arbitrary status jumps at the database level.
-- Valid transitions:
--   open       → claimed | cancelled
--   claimed    → in_transit | open (unclaim/timeout) | cancelled
--   in_transit → completed | cancelled
--   completed  → (terminal)
--   cancelled  → (terminal)

CREATE OR REPLACE FUNCTION guard_quest_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  old_s quest_status := OLD.status;
  new_s quest_status := NEW.status;
BEGIN
  IF old_s = new_s THEN
    RETURN NEW;  -- no-op
  END IF;

  IF (old_s = 'open'       AND new_s IN ('claimed',    'cancelled'))   OR
     (old_s = 'claimed'    AND new_s IN ('in_transit', 'open', 'cancelled')) OR
     (old_s = 'in_transit' AND new_s IN ('completed',  'cancelled'))
  THEN
    -- Set timing columns automatically
    CASE new_s
      WHEN 'claimed'    THEN NEW.claimed_at    = NOW();
      WHEN 'in_transit' THEN NEW.picked_up_at  = NOW();
      WHEN 'completed'  THEN NEW.completed_at  = NOW();
      WHEN 'cancelled'  THEN NEW.cancelled_at  = NOW();
      ELSE NULL;
    END CASE;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Invalid quest status transition: % → %', old_s, new_s
    USING ERRCODE = 'check_violation';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_quest_status_guard
  BEFORE UPDATE OF status ON quests
  FOR EACH ROW EXECUTE FUNCTION guard_quest_status_transition();
