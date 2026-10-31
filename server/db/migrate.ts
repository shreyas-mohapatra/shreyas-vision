import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IN_MEMORY_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  region TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fields (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  crop_category TEXT NOT NULL,
  area_value NUMERIC(10,2),
  area_unit TEXT NOT NULL DEFAULT 'acre',
  location TEXT NOT NULL,
  soil_type TEXT,
  irrigation_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  field_id TEXT NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  crop_name TEXT NOT NULL,
  growth_stage TEXT NOT NULL,
  days_since_planting INT,
  location TEXT NOT NULL,
  soil_type TEXT,
  irrigation_method TEXT,
  season TEXT,
  recent_weather TEXT,
  affected_area_percent INT,
  symptom_notes TEXT,
  previous_treatments TEXT,
  prefer_organic BOOLEAN NOT NULL DEFAULT TRUE,
  language TEXT NOT NULL DEFAULT 'en',
  health_score INT,
  overall_severity TEXT,
  urgency TEXT,
  diagnosis_json JSONB,
  treatment_json JSONB,
  model_used TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scan_images (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id TEXT NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position SMALLINT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'image/webp',
  width INT NOT NULL,
  height INT NOT NULL,
  byte_size INT NOT NULL,
  data BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS findings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id TEXT NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_position SMALLINT NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  confidence NUMERIC(4,3) NOT NULL,
  severity TEXT NOT NULL,
  evidence TEXT NOT NULL,
  box_x NUMERIC(5,4),
  box_y NUMERIC(5,4),
  box_w NUMERIC(5,4),
  box_h NUMERIC(5,4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scan_comparisons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  field_id TEXT NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  previous_scan_id TEXT NOT NULL,
  current_scan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  comparison_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id TEXT NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_insights (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  insight_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_usage_log (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  endpoint TEXT NOT NULL,
  model TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  latency_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export async function runMigrations() {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  logger.info(`Running migrations from ${schemaPath}`);

  const client = await pool.connect();
  try {
    if (env.DATABASE_URL && env.DATABASE_URL.trim() !== '') {
      // Real PostgreSQL instance: run complete schema.sql with RLS, triggers, enums
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(sql);
      logger.info('PostgreSQL schema migration applied successfully');
    } else {
      // In-memory pg-mem adapter: run pure table definitions
      const statements = IN_MEMORY_TABLES_SQL.split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const stmt of statements) {
        try {
          await client.query(stmt);
        } catch (subErr: any) {
          logger.warn(`Notice in-memory DDL: ${stmt.slice(0, 30)}...: ${subErr.message}`);
        }
      }
      logger.info('In-memory PostgreSQL schema initialized successfully');
    }
  } finally {
    client.release();
  }
}
