-- ============================================================
-- CE Empire Dashboard - Supabase Migration Script
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  open_id       VARCHAR(64) NOT NULL UNIQUE,
  name          TEXT,
  email         VARCHAR(320),
  login_method  VARCHAR(64),
  role          VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_signed_in TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Accounts (บัญชีธนาคาร) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bank_code         VARCHAR(20) NOT NULL,
  bank_name         VARCHAR(100) NOT NULL,
  account_name      VARCHAR(200) NOT NULL,
  account_number    VARCHAR(50) NOT NULL,
  balance           NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  note              TEXT,
  is_active         VARCHAR(3) NOT NULL DEFAULT 'yes' CHECK (is_active IN ('yes', 'no')),
  profile_photo_url TEXT,
  id_card_number    VARCHAR(50),
  id_card_photo_url TEXT,
  date_of_birth     TIMESTAMPTZ,
  virtual_card_number VARCHAR(100),
  card_cvv          VARCHAR(10),
  card_expiry_date  VARCHAR(10),
  account_email     VARCHAR(320),
  account_password  VARCHAR(255),
  account_type      VARCHAR(20) CHECK (account_type IN ('complete', 'skrill', 'neteller', 'bigpay')),
  account_status    VARCHAR(50),
  credit_limit      VARCHAR(10) CHECK (credit_limit IN ('50k', '200k', '500k')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Agents (ตัวแทน) ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agents (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  phone           VARCHAR(20),
  line_id         VARCHAR(100),
  note            TEXT,
  is_active       VARCHAR(3) NOT NULL DEFAULT 'yes' CHECK (is_active IN ('yes', 'no')),
  withdraw_amount NUMERIC(15, 2) DEFAULT 0.00,
  pending_amount  NUMERIC(15, 2) DEFAULT 0.00,
  start_date      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Expenses (รายจ่าย) ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id  BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
  agent_id    BIGINT REFERENCES agents(id) ON DELETE SET NULL,
  title       VARCHAR(300) NOT NULL,
  amount      NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  category    VARCHAR(100),
  status      VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  proof_url   TEXT,
  proof_key   TEXT,
  due_date    TIMESTAMPTZ,
  paid_at     TIMESTAMPTZ,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── USDT Calculations ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usdt_calculations (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buy_amount_thb  NUMERIC(15, 2) NOT NULL,
  usdt_received   NUMERIC(15, 6) NOT NULL,
  sell_rate       NUMERIC(15, 6) NOT NULL,
  cost_per_usdt   NUMERIC(15, 6) NOT NULL,
  sell_amount_thb NUMERIC(15, 2) NOT NULL,
  profit_thb      NUMERIC(15, 2) NOT NULL,
  profit_percent  NUMERIC(8, 4) NOT NULL,
  is_profit       VARCHAR(3) NOT NULL DEFAULT 'yes' CHECK (is_profit IN ('yes', 'no')),
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Settings ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id                   BIGSERIAL PRIMARY KEY,
  user_id              BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  telegram_bot_token   TEXT,
  telegram_chat_id     TEXT,
  telegram_enabled     VARCHAR(3) DEFAULT 'no' CHECK (telegram_enabled IN ('yes', 'no')),
  notify_threshold     TEXT,
  sound_enabled        VARCHAR(3) DEFAULT 'yes' CHECK (sound_enabled IN ('yes', 'no')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Pinned Items ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pinned_items (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type   VARCHAR(50) NOT NULL,
  item_id     BIGINT NOT NULL,
  label       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- ─── Projects ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  status        VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  color         VARCHAR(7) NOT NULL DEFAULT '#00d4ff',
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tasks ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id            BIGSERIAL PRIMARY KEY,
  project_id    BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         VARCHAR(300) NOT NULL,
  description   TEXT,
  status        VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority      VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date      TIMESTAMPTZ,
  assigned_to   BIGINT REFERENCES users(id),
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Profit Records ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profit_records (
  id             BIGSERIAL PRIMARY KEY,
  user_id        BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profit_thb     NUMERIC(15, 2) NOT NULL,
  profit_percent NUMERIC(8, 4) NOT NULL,
  source         VARCHAR(100) NOT NULL,
  description    TEXT,
  record_date    TIMESTAMPTZ NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_usdt_calculations_user_id ON usdt_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_profit_records_user_id ON profit_records(user_id);

-- ─── Updated_at Trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Enable Realtime ──────────────────────────────────────────────────────────
-- Run these in Supabase Dashboard > Database > Replication
-- Or via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE profit_records;

-- ─── RLS Policies ─────────────────────────────────────────────────────────────
-- NOTE: Since CE Empire uses its own JWT auth (not Supabase Auth),
-- we use service_role key on server-side to bypass RLS.
-- RLS is disabled for server-side operations.

-- Disable RLS for all tables (server uses service_role key)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE usdt_calculations DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pinned_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE profit_records DISABLE ROW LEVEL SECURITY;
