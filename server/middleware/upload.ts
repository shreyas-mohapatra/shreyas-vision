import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const storage = multer.memoryStorage();

const uploadRaw = multer({
  storage,
  limits: {
    fileSize: env.MAX_UPLOAD_MB * 1024 * 1024,
    files: env.MAX_IMAGES_PER_SCAN,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype.toLowerCase())) {
      return cb(
        new AppError(
          `Invalid file format (${file.mimetype}). Only JPEG, PNG, and WebP are supported.`,
          400,
          'INVALID_FILE_TYPE'
        )
      );
    }
    cb(null, true);
  },
});

export function handleScanImagesUpload(req: Request, res: Response, next: NextFunction) {
  const uploadMiddleware = uploadRaw.array('images', env.MAX_IMAGES_PER_SCAN);

  uploadMiddleware(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new AppError(
              `Image exceeds maximum limit of ${env.MAX_UPLOAD_MB}MB`,
              400,
              'FILE_TOO_LARGE'
            )
          );
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(
            new AppError(
              `Maximum ${env.MAX_IMAGES_PER_SCAN} images allowed per scan`,
              400,
              'TOO_MANY_FILES'
            )
          );
        }
        return next(new AppError(err.message, 400, 'UPLOAD_ERROR'));
      }
      return next(err);
    }
    next();
  });
}
