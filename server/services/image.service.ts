import sharp from 'sharp';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
  byteSize: number;
}

const ALLOWED_FORMATS = ['jpeg', 'png', 'webp'];

/**
 * Validates magic bytes, strips EXIF/GPS, auto-rotates, resizes to max 1600px,
 * and encodes to optimized WebP.
 */
export async function processAndValidateImage(fileBuffer: Buffer): Promise<ProcessedImage> {
  let metadata: any;

  try {
    const pipeline = sharp(fileBuffer);
    metadata = await pipeline.metadata();
  } catch (err: any) {
    logger.warn('Failed to parse image headers/metadata', { error: err.message });
    throw new AppError('Invalid image file format or corrupted payload', 400, 'INVALID_IMAGE');
  }

  if (!metadata.format || !ALLOWED_FORMATS.includes(metadata.format.toLowerCase())) {
    throw new AppError(
      `Unsupported image format (${metadata.format}). Allowed formats are JPEG, PNG, and WebP.`,
      400,
      'UNSUPPORTED_FORMAT'
    );
  }

  try {
    // Sharp pipeline:
    // 1. auto-rotate according to EXIF orientation
    // 2. resize longest edge to max 1600px without upscaling
    // 3. strip EXIF/GPS metadata
    // 4. convert to WebP quality 80
    const processed = await sharp(fileBuffer)
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    if (processed.info.size > 1048576) {
      // Re-compress if over 1MB
      const smaller = await sharp(processed.data)
        .webp({ quality: 65, effort: 4 })
        .toBuffer({ resolveWithObject: true });

      return {
        buffer: smaller.data,
        mimeType: 'image/webp',
        width: smaller.info.width,
        height: smaller.info.height,
        byteSize: smaller.info.size,
      };
    }

    return {
      buffer: processed.data,
      mimeType: 'image/webp',
      width: processed.info.width,
      height: processed.info.height,
      byteSize: processed.info.size,
    };
  } catch (err: any) {
    logger.error('Sharp image transformation error', err);
    throw new AppError('Failed to process and normalize crop image', 500, 'IMAGE_PROCESSING_FAILED');
  }
}
