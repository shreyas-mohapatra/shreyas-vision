import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { pool } from '../db/pool.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  region?: string;
  language: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Missing Bearer token.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;

    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Session expired. Please log in again.', 401, 'TOKEN_EXPIRED');
      }
      throw new AppError('Invalid authentication token.', 401, 'INVALID_TOKEN');
    }

    const userId = decoded.sub;
    if (!userId) {
      throw new AppError('Invalid token claims.', 401, 'INVALID_TOKEN');
    }

    // Lookup user in DB
    const res = await pool.query(
      'SELECT id, email, full_name, region, language FROM users WHERE id = $1',
      [userId]
    );

    if (res.rows.length === 0) {
      throw new AppError('User account not found or has been removed.', 401, 'USER_NOT_FOUND');
    }

    const row = res.rows[0];
    req.user = {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      region: row.region,
      language: row.language,
    };

    next();
  } catch (err) {
    next(err);
  }
}
