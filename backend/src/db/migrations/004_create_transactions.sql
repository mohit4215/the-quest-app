-- ── 004_create_transactions.sql ───────────────────────────────────────────────
-- Append-only QP ledger. Never UPDATE or DELETE rows.
-- The authoritative QP balance always lives on users.qp_balance
-- (maintained via triggers here). This table is the audit trail.

CREATE TYPE transaction_type AS ENUM (
  'quest_earned',      -- courier completed a quest
  'quest_posted',      -- requester spent QP as bounty (held in escrow)
  'quest_refund',      -- bounty returned if quest cancelled before courier earns
  'reward_redeemed',   -- QP spent at a partner shop
  'senior_bonus',      -- bonus for helpful forum answer
  'admin_credit',      -- manual QP grant by admin
  'admin_debit'        -- manual QP removal by admin
);

CREATE TABLE transactions (
  id              UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type            transaction_type  NOT NULL,
  amount          INTEGER           NOT NULL,  -- positive = credit, negative = debit
  balance_before  INTEGER           NOT NULL,
  balance_after   INTEGER           NOT NULL CHECK (balance_after >= 0),

  -- Optional linkback
  quest_id        UUID              REFERENCES quests(id) ON DELETE SET NULL,
  description     TEXT              NOT NULL,

  -- Who initiated (for admin actions)
  created_by      UUID              REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_txn_user_id          ON transactions (user_id, created_at DESC);
CREATE INDEX idx_txn_quest_id         ON transactions (quest_id);
CREATE INDEX idx_txn_type             ON transactions (type);

-- Make the table append-only: block UPDATEs and DELETEs
CREATE OR REPLACE FUNCTION block_txn_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Transactions are immutable — no UPDATE or DELETE allowed'
    USING ERRCODE = 'restrict_violation';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_txn_no_update
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION block_txn_mutation();

CREATE TRIGGER trg_txn_no_delete
  BEFORE DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION block_txn_mutation();
