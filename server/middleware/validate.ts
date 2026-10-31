import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

interface ValidationSchema {
  body?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
}

export function validate(schemas: ValidationSchema) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as any;
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as any;
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        next(
          new AppError(
            details[0]?.message || 'Input validation failed',
            400,
            'VALIDATION_ERROR',
            details
          )
        );
      } else {
        next(err);
      }
    }
  };
}
