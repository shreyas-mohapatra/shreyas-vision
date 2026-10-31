import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { AppError } from '../utils/AppError.js';

// Global limiter: 300 req / 15 min / IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  handler: (_req, _res, next) => {
    next(new AppError('Too many requests. Please slow down and try again later.', 429, 'RATE_LIMIT_EXCEEDED'));
  },
});

// Auth limiter: 10 req / 15 min / IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  handler: (_req, _res, next) => {
    next(new AppError('Too many authentication attempts. Please wait 15 minutes before trying again.', 429, 'AUTH_RATE_LIMIT_EXCEEDED'));
  },
});

// Scan creation limiter: 5 / min / user
export const scanCreateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
  keyGenerator: (req: Request) => req.user?.id || req.ip || 'anonymous',
  handler: (_req, _res, next) => {
    next(new AppError('Scan submission frequency exceeded (max 5 per minute). Please wait a moment.', 429, 'SCAN_RATE_LIMIT_EXCEEDED'));
  },
});
