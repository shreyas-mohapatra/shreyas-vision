import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  CLIENT_ORIGIN: z.string().default('http://localhost:3000'),

  DATABASE_URL: z.string().optional().default(''),
  DATABASE_SSL: z.preprocess((val) => val === 'true' || val === true, z.boolean().default(false)),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long')
    .default('agrilens_super_secure_jwt_secret_key_at_least_32_characters_long_2026'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().min(8).max(14).default(12),

  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required').default(process.env.GEMINI_API_KEY || ''),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  AI_TIMEOUT_MS: z.coerce.number().default(45000),

  MAX_UPLOAD_MB: z.coerce.number().default(8),
  MAX_IMAGES_PER_SCAN: z.coerce.number().default(4),
  DAILY_SCAN_LIMIT: z.coerce.number().default(20),
  DAILY_CHAT_LIMIT: z.coerce.number().default(60),

  DEMO_PASSWORD: z.string().default('DemoPassword123!'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid or missing environment configuration:');
  console.error(parsed.error.format());
  throw new Error('Environment validation failed');
}

export const env = parsed.data;
