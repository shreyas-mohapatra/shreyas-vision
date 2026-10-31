import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { pool } from '../db/pool.js';
import { AppError } from '../utils/AppError.js';

export async function checkDailyScanQuota(req: Request, _res: Response, next: NextFunction) {
  if (!req.user?.id) {
    return next(new AppError('User authentication required for scan quota check', 401, 'UNAUTHORIZED'));
  }

  try {
    const res = await pool.query(
      `SELECT COUNT(*) as count
       FROM ai_usage_log
       WHERE user_id = $1
         AND endpoint = 'diagnosis'
         AND created_at >= NOW() - INTERVAL '24 hours'`,
      [req.user.id]
    );

    const count = parseInt(res.rows[0]?.count || '0', 10);
    if (count >= env.DAILY_SCAN_LIMIT) {
      return next(
        new AppError(
          `Daily AI scan quota reached (${env.DAILY_SCAN_LIMIT} scans per 24 hours). Please return tomorrow or contact support.`,
          429,
          'DAILY_SCAN_QUOTA_EXCEEDED'
        )
      );
    }
    next();
  } catch (err) {
    // If table doesn't exist yet or query fails, allow proceed
    next();
  }
}

export async function checkDailyChatQuota(req: Request, _res: Response, next: NextFunction) {
  if (!req.user?.id) {
    return next(new AppError('User authentication required for chat quota check', 401, 'UNAUTHORIZED'));
  }

  try {
    const res = await pool.query(
      `SELECT COUNT(*) as count
       FROM ai_usage_log
       WHERE user_id = $1
         AND endpoint = 'chat'
         AND created_at >= NOW() - INTERVAL '24 hours'`,
      [req.user.id]
    );

    const count = parseInt(res.rows[0]?.count || '0', 10);
    if (count >= env.DAILY_CHAT_LIMIT) {
      return next(
        new AppError(
          `Daily agronomy chat question limit reached (${env.DAILY_CHAT_LIMIT} per 24 hours).`,
          429,
          'DAILY_CHAT_QUOTA_EXCEEDED'
        )
      );
    }
    next();
  } catch (err) {
    next();
  }
}
