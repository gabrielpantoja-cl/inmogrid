-- =============================================================
-- INMOGRID.CL — Migration 001: Initial Schema (Supabase Auth)
-- Project ref: <SUPABASE_PROJECT_REF>
-- Apply manually in Supabase Studio > SQL Editor
-- =============================================================
-- SAFETY NOTES:
--   * All tables use the inmogrid_ prefix to avoid collisions with
--     pantojapropiedades tables (profiles, etc.) that share the
--     same Supabase project.
--   * auth.users is managed exclusively by Supabase Auth.
--     We never INSERT/UPDATE into auth.users from this script.
--   * Run this script once. It is idempotent (IF NOT EXISTS).
-- =============================================================

-- -------------------------------------------------------
-- 1. ENUMS
-- -------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('user', 'admin', 'superadmin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ProfessionType" AS ENUM (
    'TASADOR_PERITO',
    'PERITO_JUDICIAL',
    'CORREDOR_PROPIEDADES',
    'ADMINISTRADOR_PROP',
    'ABOGADO_INMOBILIARIO',
    'ARQUITECTO',
    'INGENIERO_CIVIL',
    'ACADEMICO',
    'FUNCIONARIO_PUBLICO',
    'INVERSIONISTA',
    'PROPIETARIO',
    'OTRO'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ConnectionStatus" AS ENUM ('pending', 'accepted', 'rejected', 'blocked');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "MessageRole" AS ENUM ('user', 'bot');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "EventStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "EventType" AS ENUM (
    'TALLER', 'SEMINARIO', 'CHARLA', 'CURSO', 'OPEN_HOUSE', 'LANZAMIENTO'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "OrganizerType" AS ENUM (
    'MUNICIPAL', 'UNIVERSITARIO', 'GREMIAL', 'COMERCIAL'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- -------------------------------------------------------
-- 2. inmogrid_profiles
--    id = auth.users.id (UUID assigned by Supabase Auth)
--    A trigger on auth.users will insert a row here on signup.
-- -------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.inmogrid_profiles (
  id               UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username         TEXT          UNIQUE,
  full_name        TEXT,
  avatar_url       TEXT,
  bio              TEXT,
  profession       "ProfessionType",
  company          TEXT,
  phone            TEXT,
  region           TEXT,
  commune          TEXT,
  website          TEXT,
  linkedin         TEXT,
  tagline          TEXT,
  cover_image_url  TEXT,
  location         TEXT,
  identity_tags    TEXT[]        NOT NULL DEFAULT '{}',
  external_links   JSONB,
  is_public_profile BOOLEAN      NOT NULL DEFAULT TRUE,
  role             "Role"        NOT NULL DEFAULT 'user',
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.inmogrid_profiles IS
  'INMOGRID user profiles. id mirrors auth.users.id (Supabase Auth UUID).';

-- -------------------------------------------------------
-- 3. inmogrid_connections
-- -------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.inmogrid_connections (
  id            TEXT          PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  requester_id  UUID          NOT NULL REFERENCES public.inmogrid_profiles(id) ON DELETE CASCADE,
  receiver_id   UUID          NOT NULL REFERENCES public.inmogrid_profiles(id) ON DELETE CASCADE,
  status        "ConnectionStatus" NOT NULL DEFAULT 'pending',
  message       TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT inmogrid_connections_unique_pair UNIQUE (requester_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_inmogrid_connections_receiver_status
  ON public.inmogrid_connections (receiver_id, status);

CREATE INDEX IF NOT EXISTS idx_inmogrid_connections_requester_status
  ON public.inmogrid_connections (requester_id, status);

-- -------------------------------------------------------
-- 4. inmogrid_posts
-- -------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.inmogrid_posts (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         UUID        NOT NULL REFERENCES public.inmogrid_profiles(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  slug            TEXT        NOT NULL UNIQUE,
  content         TEXT        NOT NULL,
  excerpt         TEXT,
  cover_image_url TEXT,
  published       BOOLEAN     NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  tags            TEXT[]      NOT NULL DEFAULT '{}',
  read_time       INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inmogrid_posts_slug
  ON public.inmogrid_posts (slug);

CREATE INDEX IF NOT EXISTS idx_inmogrid_posts_user_published
  ON public.inmogrid_posts (user_id, published);

-- -------------------------------------------------------
-- 5. inmogrid_events
-- -------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.inmogrid_events (
  id               TEXT            PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title            TEXT            NOT NULL,
  description      TEXT            NOT NULL,
  organizer_name   TEXT            NOT NULL,
  organizer_type   "OrganizerType" NOT NULL,
  event_type       "EventType"     NOT NULL,
  start_date       TIMESTAMPTZ     NOT NULL,
  end_date         TIMESTAMPTZ,
  location         TEXT,
  is_online        BOOLEAN         NOT NULL DEFAULT FALSE,
  online_url       TEXT,
  cover_image_url  TEXT,
  registration_url TEXT,
  is_free          BOOLEAN         NOT NULL DEFAULT TRUE,
  is_commercial    BOOLEAN         NOT NULL DEFAULT FALSE,
  is_paid          BOOLEAN         NOT NULL DEFAULT FALSE,
  price            FLOAT,
  status           "EventStatus"   NOT NULL DEFAULT 'PENDING',
  published_at     TIMESTAMPTZ,
  region           TEXT,
  commune          TEXT,
  user_id          UUID            REFERENCES public.inmogrid_profiles(id),
  created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inmogrid_events_status_start
  ON public.inmogrid_events (status, start_date);

CREATE INDEX IF NOT EXISTS idx_inmogrid_events_region_status
  ON public.inmogrid_events (region, status);

CREATE INDEX IF NOT EXISTS idx_inmogrid_events_commercial_status
  ON public.inmogrid_events (is_commercial, status);

-- -------------------------------------------------------
-- 6. inmogrid_professional_profiles
-- -------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.inmogrid_professional_profiles (
  id               TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id          UUID        NOT NULL UNIQUE REFERENCES public.inmogrid_profiles(id) ON DELETE CASCADE,
  specialty        TEXT[]      NOT NULL DEFAULT '{}',
  certifications   TEXT[]      NOT NULL DEFAULT '{}',
  regions          TEXT[]      NOT NULL DEFAULT '{}',
  years_experience INT,
  is_verified      BOOLEAN     NOT NULL DEFAULT FALSE,
  verified_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- 7. inmogrid_audit_logs
-- -------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.inmogrid_audit_logs (
  id         TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id    UUID        NOT NULL REFERENCES public.inmogrid_profiles(id),
  action     TEXT        NOT NULL,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- 8. inmogrid_chat_messages
-- -------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.inmogrid_chat_messages (
  id         TEXT          PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id    UUID          NOT NULL REFERENCES public.inmogrid_profiles(id) ON DELETE CASCADE,
  role       "MessageRole" NOT NULL,
  content    TEXT          NOT NULL,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inmogrid_chat_messages_user_created
  ON public.inmogrid_chat_messages (user_id, created_at);

-- -------------------------------------------------------
-- 9. updated_at trigger function (shared)
-- -------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables that have updated_at

DO $$ BEGIN
  CREATE TRIGGER trg_inmogrid_profiles_updated_at
    BEFORE UPDATE ON public.inmogrid_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_inmogrid_connections_updated_at
    BEFORE UPDATE ON public.inmogrid_connections
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_inmogrid_posts_updated_at
    BEFORE UPDATE ON public.inmogrid_posts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_inmogrid_events_updated_at
    BEFORE UPDATE ON public.inmogrid_events
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_inmogrid_professional_profiles_updated_at
    BEFORE UPDATE ON public.inmogrid_professional_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -------------------------------------------------------
-- 10. Auto-create inmogrid_profile on new Supabase Auth signup
-- -------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_inmogrid_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.inmogrid_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  CREATE TRIGGER trg_on_auth_user_created_inmogrid
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_inmogrid_user();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -------------------------------------------------------
-- 11. Row Level Security (RLS)
-- -------------------------------------------------------

ALTER TABLE public.inmogrid_profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inmogrid_connections         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inmogrid_posts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inmogrid_events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inmogrid_professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inmogrid_audit_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inmogrid_chat_messages       ENABLE ROW LEVEL SECURITY;

-- inmogrid_profiles: public profiles are readable by everyone; owner can update
-- Note: PostgreSQL does not support CREATE POLICY IF NOT EXISTS.
--       Using DROP + CREATE pattern for idempotency.

DROP POLICY IF EXISTS "inmogrid_profiles_public_read" ON public.inmogrid_profiles;
CREATE POLICY "inmogrid_profiles_public_read"
  ON public.inmogrid_profiles FOR SELECT
  USING (is_public_profile = TRUE OR auth.uid() = id);

DROP POLICY IF EXISTS "inmogrid_profiles_owner_update" ON public.inmogrid_profiles;
CREATE POLICY "inmogrid_profiles_owner_update"
  ON public.inmogrid_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- inmogrid_profiles: auto-insert on signup is handled by SECURITY DEFINER trigger
DROP POLICY IF EXISTS "inmogrid_profiles_owner_insert" ON public.inmogrid_profiles;
CREATE POLICY "inmogrid_profiles_owner_insert"
  ON public.inmogrid_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- inmogrid_connections: parties can read their own connections
DROP POLICY IF EXISTS "inmogrid_connections_parties_read" ON public.inmogrid_connections;
CREATE POLICY "inmogrid_connections_parties_read"
  ON public.inmogrid_connections FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "inmogrid_connections_requester_insert" ON public.inmogrid_connections;
CREATE POLICY "inmogrid_connections_requester_insert"
  ON public.inmogrid_connections FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "inmogrid_connections_receiver_update" ON public.inmogrid_connections;
CREATE POLICY "inmogrid_connections_receiver_update"
  ON public.inmogrid_connections FOR UPDATE
  USING (auth.uid() = receiver_id OR auth.uid() = requester_id);

-- inmogrid_posts: published posts are public; owner manages all
DROP POLICY IF EXISTS "inmogrid_posts_public_read" ON public.inmogrid_posts;
CREATE POLICY "inmogrid_posts_public_read"
  ON public.inmogrid_posts FOR SELECT
  USING (published = TRUE OR auth.uid() = user_id);

DROP POLICY IF EXISTS "inmogrid_posts_owner_write" ON public.inmogrid_posts;
CREATE POLICY "inmogrid_posts_owner_write"
  ON public.inmogrid_posts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- inmogrid_events: published events are public; owner manages own events
DROP POLICY IF EXISTS "inmogrid_events_public_read" ON public.inmogrid_events;
CREATE POLICY "inmogrid_events_public_read"
  ON public.inmogrid_events FOR SELECT
  USING (status = 'PUBLISHED' OR auth.uid() = user_id);

DROP POLICY IF EXISTS "inmogrid_events_owner_write" ON public.inmogrid_events;
CREATE POLICY "inmogrid_events_owner_write"
  ON public.inmogrid_events FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- inmogrid_professional_profiles: public read; owner write
DROP POLICY IF EXISTS "inmogrid_professional_profiles_public_read" ON public.inmogrid_professional_profiles;
CREATE POLICY "inmogrid_professional_profiles_public_read"
  ON public.inmogrid_professional_profiles FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "inmogrid_professional_profiles_owner_write" ON public.inmogrid_professional_profiles;
CREATE POLICY "inmogrid_professional_profiles_owner_write"
  ON public.inmogrid_professional_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- inmogrid_chat_messages: owner only
DROP POLICY IF EXISTS "inmogrid_chat_messages_owner_all" ON public.inmogrid_chat_messages;
CREATE POLICY "inmogrid_chat_messages_owner_all"
  ON public.inmogrid_chat_messages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- inmogrid_audit_logs: owner read; system writes via SECURITY DEFINER functions
DROP POLICY IF EXISTS "inmogrid_audit_logs_owner_read" ON public.inmogrid_audit_logs;
CREATE POLICY "inmogrid_audit_logs_owner_read"
  ON public.inmogrid_audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- -------------------------------------------------------
-- END OF MIGRATION 001
-- -------------------------------------------------------
