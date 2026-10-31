import bcrypt from 'bcryptjs';
import { pool } from './pool.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export async function seedDatabase() {
  if (env.NODE_ENV === 'production') {
    logger.info('Skipping database seeding in production environment');
    return;
  }

  const client = await pool.connect();
  try {
    const existing = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['demo@agrilens.app']
    );

    if (existing.rows.length > 0) {
      logger.info('Demo user already exists, skipping seed');
      return;
    }

    logger.info('Seeding demo user and initial sample field...');
    const passwordHash = await bcrypt.hash(env.DEMO_PASSWORD, env.BCRYPT_ROUNDS);

    const userRes = await client.query(
      `INSERT INTO users (email, password_hash, full_name, region, language)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ['demo@agrilens.app', passwordHash, 'Sahil Mohapatra (Demo Farm)', 'Punjab, India', 'en']
    );

    const userId = userRes.rows[0].id;

    await client.query(
      `INSERT INTO fields (user_id, name, crop_name, crop_category, area_value, area_unit, location, soil_type, irrigation_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        userId,
        'North Wheat Field (Plot A)',
        'wheat',
        'cereals',
        4.5,
        'acre',
        'Ludhiana, Punjab',
        'alluvial',
        'sprinkler',
      ]
    );

    logger.info('Seed completed successfully. Demo credentials: demo@agrilens.app');
  } catch (err: any) {
    logger.error('Error during seeding', err);
  } finally {
    client.release();
  }
}
