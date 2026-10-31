-- AgriLens Production PostgreSQL Schema
-- Theme: Computer Vision & Visual Intelligence

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
  CREATE TYPE finding_category AS ENUM (
    'fungal_disease','bacterial_disease','viral_disease','insect_pest','mite_pest',
    'nutrient_deficiency','water_stress','heat_or_cold_stress','weed_pressure',
    'physical_damage','healthy','unclear'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE severity_level AS ENUM ('none','low','medium','high','critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE urgency_level AS ENUM ('monitor','act_this_week','act_within_48h','act_today');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE progression_status AS ENUM
    ('improved','stable','worsening','new_issue_detected','insufficient_data');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE scan_status AS ENUM ('pending','processing','completed','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helper: updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL CHECK (email = LOWER(email) AND char_length(email) <= 254),
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  region        TEXT,
  language      TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en','hi','bn','te','ta','mr')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (LOWER(email));
DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Fields Table
CREATE TABLE IF NOT EXISTS fields (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  crop_name         TEXT NOT NULL,
  crop_category     TEXT NOT NULL,
  area_value        NUMERIC(10,2) CHECK (area_value IS NULL OR area_value > 0),
  area_unit         TEXT NOT NULL DEFAULT 'acre' CHECK (area_unit IN ('acre','hectare')),
  location          TEXT NOT NULL,
  soil_type         TEXT,
  irrigation_method TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS fields_user_idx ON fields (user_id, created_at DESC);
DROP TRIGGER IF EXISTS trg_fields_updated ON fields;
CREATE TRIGGER trg_fields_updated BEFORE UPDATE ON fields
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Scans Table
CREATE TABLE IF NOT EXISTS scans (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  field_id              UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  status                scan_status NOT NULL DEFAULT 'pending',
  crop_name             TEXT NOT NULL,
  growth_stage          TEXT NOT NULL,
  days_since_planting   INT CHECK (days_since_planting IS NULL OR days_since_planting BETWEEN 0 AND 400),
  location              TEXT NOT NULL,
  soil_type             TEXT,
  irrigation_method     TEXT,
  season                TEXT,
  recent_weather        TEXT,
  affected_area_percent INT CHECK (affected_area_percent IS NULL OR affected_area_percent BETWEEN 0 AND 100),
  symptom_notes         TEXT CHECK (symptom_notes IS NULL OR char_length(symptom_notes) <= 1000),
  previous_treatments   TEXT CHECK (previous_treatments IS NULL OR char_length(previous_treatments) <= 500),
  prefer_organic        BOOLEAN NOT NULL DEFAULT TRUE,
  language              TEXT NOT NULL DEFAULT 'en',
  health_score          INT CHECK (health_score IS NULL OR health_score BETWEEN 0 AND 100),
  overall_severity      severity_level,
  urgency               urgency_level,
  diagnosis_json        JSONB,
  treatment_json        JSONB,
  model_used            TEXT,
  error_message         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS scans_user_idx ON scans (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS scans_field_idx ON scans (field_id, created_at DESC);
CREATE INDEX IF NOT EXISTS scans_severity_idx ON scans (user_id, overall_severity);
DROP TRIGGER IF EXISTS trg_scans_updated ON scans;
CREATE TRIGGER trg_scans_updated BEFORE UPDATE ON scans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Scan Images Table
CREATE TABLE IF NOT EXISTS scan_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id     UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position    SMALLINT NOT NULL CHECK (position BETWEEN 0 AND 3),
  mime_type   TEXT NOT NULL DEFAULT 'image/webp',
  width       INT NOT NULL,
  height      INT NOT NULL,
  byte_size   INT NOT NULL CHECK (byte_size <= 1048576),
  data        BYTEA NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (scan_id, position)
);
CREATE INDEX IF NOT EXISTS scan_images_scan_idx ON scan_images (scan_id);

-- Findings Table
CREATE TABLE IF NOT EXISTS findings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id        UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_position SMALLINT NOT NULL DEFAULT 0,
  category       finding_category NOT NULL,
  name           TEXT NOT NULL,
  confidence     NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  severity       severity_level NOT NULL,
  evidence       TEXT NOT NULL,
  box_x          NUMERIC(5,4) CHECK (box_x BETWEEN 0 AND 1),
  box_y          NUMERIC(5,4) CHECK (box_y BETWEEN 0 AND 1),
  box_w          NUMERIC(5,4) CHECK (box_w BETWEEN 0 AND 1),
  box_h          NUMERIC(5,4) CHECK (box_h BETWEEN 0 AND 1),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS findings_scan_idx ON findings (scan_id);
CREATE INDEX IF NOT EXISTS findings_user_cat_idx ON findings (user_id, category, name);

-- Scan Comparisons Table
CREATE TABLE IF NOT EXISTS scan_comparisons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  field_id         UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  previous_scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  current_scan_id  UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  status           progression_status NOT NULL,
  comparison_json  JSONB NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (previous_scan_id, current_scan_id),
  CHECK (previous_scan_id <> current_scan_id)
);
CREATE INDEX IF NOT EXISTS comparisons_field_idx ON scan_comparisons (field_id, created_at DESC);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id    UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content    TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS chat_scan_idx ON chat_messages (scan_id, created_at);

-- Weekly Insights Table
CREATE TABLE IF NOT EXISTS weekly_insights (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start   DATE NOT NULL,
  insight_json JSONB NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, week_start)
);

-- AI Usage Log Table
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  endpoint      TEXT NOT NULL,
  model         TEXT NOT NULL,
  success       BOOLEAN NOT NULL,
  latency_ms    INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ai_usage_user_idx ON ai_usage_log (user_id, created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE fields           ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans            ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_images      ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_insights  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS owner_isolation ON fields;
CREATE POLICY owner_isolation ON fields
  USING      (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
  WITH CHECK (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid);

DROP POLICY IF EXISTS owner_isolation ON scans;
CREATE POLICY owner_isolation ON scans
  USING      (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
  WITH CHECK (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid);

DROP POLICY IF EXISTS owner_isolation ON scan_images;
CREATE POLICY owner_isolation ON scan_images
  USING      (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
  WITH CHECK (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid);

DROP POLICY IF EXISTS owner_isolation ON findings;
CREATE POLICY owner_isolation ON findings
  USING      (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
  WITH CHECK (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid);

DROP POLICY IF EXISTS owner_isolation ON scan_comparisons;
CREATE POLICY owner_isolation ON scan_comparisons
  USING      (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
  WITH CHECK (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid);

DROP POLICY IF EXISTS owner_isolation ON chat_messages;
CREATE POLICY owner_isolation ON chat_messages
  USING      (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
  WITH CHECK (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid);

DROP POLICY IF EXISTS owner_isolation ON weekly_insights;
CREATE POLICY owner_isolation ON weekly_insights
  USING      (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
  WITH CHECK (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid);
