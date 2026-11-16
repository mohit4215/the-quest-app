-- ── 006_batching_scheduling_trust.sql ─────────────────────────────────────────
-- Adds support for:
--  1. Multi-order batching metadata
--  2. Dynamic UPI reimbursement (item_cost, courier_upi_id)
--  3. Scheduled / Pre-order execution times
--  4. Vendor order statuses (preparing, ready_for_pickup)
--  5. Trust & reliability ratings (1-5 stars, timeout auto-release)

-- 1. Extend quests table
ALTER TABLE quests
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS item_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS courier_upi_id TEXT,
  ADD COLUMN IF NOT EXISTS claim_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS vendor_status TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS rating_comment TEXT;

-- 2. Extend users table for reliability metrics & ratings
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  ADD COLUMN IF NOT EXISTS rating_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS upi_id TEXT,
  ADD COLUMN IF NOT EXISTS is_quester_suspended BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Indexes for high-speed queries
CREATE INDEX IF NOT EXISTS idx_quests_scheduled ON quests (scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quests_vendor_status ON quests (vendor_status);
CREATE INDEX IF NOT EXISTS idx_quests_claim_expires ON quests (claim_expires_at) WHERE status = 'claimed';
CREATE INDEX IF NOT EXISTS idx_quests_courier_active ON quests (courier_id, status);
