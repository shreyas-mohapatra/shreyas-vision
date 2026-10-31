import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred. Please try again.';
  const details = err.details || [];

  if (statusCode >= 500) {
    logger.error('Unhandled Server Error', err);
  } else {
    logger.warn(`Operational warning [${statusCode} ${code}]: ${message}`);
  }

  res.status(statusCode).json({
    error: {
      code,
      message: statusCode >= 500 && env.NODE_ENV === 'production'
        ? 'Internal server error. Please try again later.'
        : message,
      details,
    },
  });
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError('The requested resource or endpoint was not found.', 404, 'NOT_FOUND'));
}
