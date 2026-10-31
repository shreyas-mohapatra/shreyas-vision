import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

function createToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, fullName, region } = req.body;

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      throw new AppError('An account with this email address already exists.', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, region, language)
       VALUES ($1, $2, $3, $4, 'en')
       RETURNING id, email, full_name, region, language, created_at`,
      [email, passwordHash, fullName, region || null]
    );

    const user = result.rows[0];
    const token = createToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        region: user.region,
        language: user.language,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, region, language, created_at FROM users WHERE email = $1',
      [email]
    );

    // Constant-time check pattern
    if (result.rows.length === 0) {
      // Run dummy compare to avoid timing leak
      await bcrypt.compare(password, '$2a$12$e8YkC0lP/sW7P.Z3r8Oa7uV4vT49g5r4p3Ww1q7z6.1y0gU3C2K.m');
      throw new AppError('Invalid email or password credentials.', 401, 'INVALID_CREDENTIALS');
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid email or password credentials.', 401, 'INVALID_CREDENTIALS');
    }

    const token = createToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        region: user.region,
        language: user.language,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, region, language, created_at FROM users WHERE id = $1',
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        region: user.region,
        language: user.language,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { fullName, region, language } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           region = COALESCE($2, region),
           language = COALESCE($3, language),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, full_name, region, language, created_at`,
      [fullName || null, region || null, language || null, req.user!.id]
    );

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        region: user.region,
        language: user.language,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;

    const userRes = await pool.query('SELECT password_hash FROM users WHERE id = $1', [
      req.user!.id,
    ]);

    if (userRes.rows.length === 0) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
    if (!isMatch) {
      throw new AppError('Current password is not correct.', 400, 'INCORRECT_PASSWORD');
    }

    const newHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      newHash,
      req.user!.id,
    ]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const { password } = req.body;

    const userRes = await pool.query('SELECT password_hash FROM users WHERE id = $1', [
      req.user!.id,
    ]);

    if (userRes.rows.length === 0) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(password, userRes.rows[0].password_hash);
    if (!isMatch) {
      throw new AppError('Password verification failed.', 401, 'INVALID_CREDENTIALS');
    }

    // Cascade delete user
    await pool.query('DELETE FROM users WHERE id = $1', [req.user!.id]);

    res.json({ message: 'Account and associated field scan records permanently deleted.' });
  } catch (err) {
    next(err);
  }
}
