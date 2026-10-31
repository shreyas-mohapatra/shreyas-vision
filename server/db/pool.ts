import pg from 'pg';
import crypto from 'crypto';
import { newDb } from 'pg-mem';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let poolInstance: any = null;

export function getPool() {
  if (poolInstance) {
    return poolInstance;
  }

  if (env.DATABASE_URL && env.DATABASE_URL.trim() !== '') {
    logger.info('Connecting to PostgreSQL database via DATABASE_URL');
    poolInstance = new pg.Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
      max: 15,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    poolInstance.on('error', (err: any) => {
      logger.error('Unexpected error on idle PostgreSQL client', err);
    });
  } else {
    logger.info('DATABASE_URL not set; initializing robust in-memory PostgreSQL engine (pg-mem)');
    try {
      const db = newDb();

      // Register standard Postgres helper functions
      db.public.registerFunction({
        name: 'gen_random_uuid',
        returns: (db.public as any).getType('text'),
        implementation: () => crypto.randomUUID(),
      });
      db.public.registerFunction({
        name: 'set_config',
        args: [(db.public as any).getType('text'), (db.public as any).getType('text'), (db.public as any).getType('bool')],
        returns: (db.public as any).getType('text'),
        implementation: () => '',
      });
      db.public.registerFunction({
        name: 'current_setting',
        args: [(db.public as any).getType('text'), (db.public as any).getType('bool')],
        returns: (db.public as any).getType('text'),
        implementation: () => '',
      });

      const pgAdapter = db.adapters.createPg();
      poolInstance = new pgAdapter.Pool();
    } catch (e: any) {
      logger.warn('pg-mem setup fallback, creating standard pg client pool', { error: e.message });
      poolInstance = new pg.Pool();
    }
  }

  return poolInstance;
}

export const pool = getPool();
