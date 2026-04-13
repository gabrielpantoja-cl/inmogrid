-- ============================================================
-- ADR-005: Contribution staging table for user-submitted data
-- Run manually in Supabase SQL Editor
-- Date: 2026-04-12
-- ============================================================

CREATE TABLE inmogrid_contributions (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_id         TEXT,              -- Neon referencial ID (corrections/reports link here)
  contribution_type TEXT NOT NULL DEFAULT 'new'
    CHECK (contribution_type IN ('new', 'correction', 'report')),
  lat               DOUBLE PRECISION NOT NULL,
  lng               DOUBLE PRECISION NOT NULL,
  fojas             TEXT,
  numero            INTEGER,
  anio              INTEGER,
  cbr               TEXT,
  predio            TEXT,
  comuna            TEXT,
  rol               TEXT,
  fechaescritura    TIMESTAMPTZ,
  superficie        DOUBLE PRECISION,
  monto             BIGINT,
  observaciones     TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_id       UUID REFERENCES auth.users(id),
  review_note       TEXT,
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_contributions_user_id ON inmogrid_contributions(user_id);
CREATE INDEX idx_contributions_status ON inmogrid_contributions(status);
CREATE INDEX idx_contributions_source_id ON inmogrid_contributions(source_id);
CREATE INDEX idx_contributions_comuna ON inmogrid_contributions(comuna);

-- Row Level Security
ALTER TABLE inmogrid_contributions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own contributions
CREATE POLICY "users_read_own" ON inmogrid_contributions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own contributions
CREATE POLICY "users_insert_own" ON inmogrid_contributions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can read/update/delete all contributions
CREATE POLICY "admins_all" ON inmogrid_contributions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM inmogrid_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'superadmin')
    )
  );
