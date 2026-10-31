import { Request, Response, NextFunction } from 'express';
import { withUser } from '../db/withUser.js';
import { AppError } from '../utils/AppError.js';
import { processAndValidateImage, ProcessedImage } from '../services/image.service.js';
import { runDiagnosis } from '../services/diagnosis.service.js';
import { runTreatmentPlan } from '../services/treatment.service.js';
import { scanPayloadSchema, scanFilterSchema } from '../schemas/scan.schema.js';
import { MODEL } from '../services/gemini.js';
import { logger } from '../utils/logger.js';

export async function createScan(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError('At least 1 crop photo is required for visual diagnosis.', 400, 'NO_IMAGES');
    }
    if (files.length > 4) {
      throw new AppError('Maximum 4 images allowed per scan.', 400, 'TOO_MANY_IMAGES');
    }

    let payload: any;
    try {
      payload = typeof req.body.payload === 'string' ? JSON.parse(req.body.payload) : req.body;
    } catch {
      throw new AppError('Invalid JSON in scan metadata payload', 400, 'INVALID_PAYLOAD');
    }

    const validatedPayload = scanPayloadSchema.parse(payload);

    // Verify field exists and belongs to user
    const fieldExists = await withUser(userId, async (client) => {
      const res = await client.query('SELECT id, name FROM fields WHERE id = $1 AND user_id = $2', [
        validatedPayload.fieldId,
        userId,
      ]);
      return res.rows[0];
    });

    if (!fieldExists) {
      throw new AppError('Specified field does not exist', 404, 'FIELD_NOT_FOUND');
    }

    // Process & normalize images with Sharp (security & optimization)
    const processedImages: ProcessedImage[] = [];
    for (const f of files) {
      const processed = await processAndValidateImage(f.buffer);
      processedImages.push(processed);
    }

    // Insert scan in 'processing' status
    const scanId = await withUser(userId, async (client) => {
      const result = await client.query(
        `INSERT INTO scans (
          user_id, field_id, status, crop_name, growth_stage, days_since_planting,
          location, soil_type, irrigation_method, season, recent_weather,
          affected_area_percent, symptom_notes, previous_treatments, prefer_organic, language
        ) VALUES ($1, $2, 'processing', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id`,
        [
          userId,
          validatedPayload.fieldId,
          validatedPayload.cropName,
          validatedPayload.growthStage,
          validatedPayload.daysSincePlanting ?? null,
          validatedPayload.location,
          validatedPayload.soilType ?? null,
          validatedPayload.irrigationMethod ?? null,
          validatedPayload.season ?? null,
          validatedPayload.recentWeather ?? null,
          validatedPayload.affectedAreaPercent ?? null,
          validatedPayload.symptomNotes ?? null,
          validatedPayload.previousTreatments ?? null,
          validatedPayload.preferOrganic,
          validatedPayload.language,
        ]
      );
      return result.rows[0].id;
    });

    // Store images in scan_images table
    await withUser(userId, async (client) => {
      for (let i = 0; i < processedImages.length; i++) {
        const img = processedImages[i];
        await client.query(
          `INSERT INTO scan_images (scan_id, user_id, position, mime_type, width, height, byte_size, data)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [scanId, userId, i, img.mimeType, img.width, img.height, img.byteSize, img.buffer]
        );
      }
    });

    // Run AI Diagnosis with Gemini
    const diagnosisResult = await runDiagnosis(
      processedImages.map((img) => ({ mimeType: img.mimeType, data: img.buffer })),
      {
        cropName: validatedPayload.cropName,
        growthStage: validatedPayload.growthStage,
        daysSincePlanting: validatedPayload.daysSincePlanting,
        location: validatedPayload.location,
        season: validatedPayload.season,
        recentWeather: validatedPayload.recentWeather,
        soilType: validatedPayload.soilType,
        irrigationMethod: validatedPayload.irrigationMethod,
        affectedAreaPercent: validatedPayload.affectedAreaPercent,
        previousTreatments: validatedPayload.previousTreatments,
        symptomNotes: validatedPayload.symptomNotes,
        language: validatedPayload.language,
        imageCount: processedImages.length,
      },
      userId
    );

    // Run AI Treatment Plan
    const treatmentResult = await runTreatmentPlan(
      {
        diagnosisJson: diagnosisResult,
        cropName: validatedPayload.cropName,
        growthStage: validatedPayload.growthStage,
        location: validatedPayload.location,
        season: validatedPayload.season,
        recentWeather: validatedPayload.recentWeather,
        irrigationMethod: validatedPayload.irrigationMethod,
        preferOrganic: validatedPayload.preferOrganic,
        previousTreatments: validatedPayload.previousTreatments,
        language: validatedPayload.language,
      },
      userId
    );

    // Update scan & store findings
    const completedScan = await withUser(userId, async (client) => {
      // Update scan row
      const updateRes = await client.query(
        `UPDATE scans
         SET status = 'completed',
             health_score = $1,
             overall_severity = $2,
             urgency = $3,
             diagnosis_json = $4,
             treatment_json = $5,
             model_used = $6,
             updated_at = NOW()
         WHERE id = $7 AND user_id = $8
         RETURNING *`,
        [
          diagnosisResult.healthScore,
          diagnosisResult.overallSeverity,
          diagnosisResult.urgency,
          JSON.stringify(diagnosisResult),
          JSON.stringify(treatmentResult),
          MODEL,
          scanId,
          userId,
        ]
      );

      // Store normalized findings
      for (const finding of diagnosisResult.findings) {
        await client.query(
          `INSERT INTO findings (
            scan_id, user_id, image_position, category, name, confidence,
            severity, evidence, box_x, box_y, box_w, box_h
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            scanId,
            userId,
            finding.imageIndex,
            finding.category,
            finding.name,
            finding.confidence,
            finding.severity,
            finding.evidence,
            finding.box.x,
            finding.box.y,
            finding.box.w,
            finding.box.h,
          ]
        );
      }

      return updateRes.rows[0];
    });

    res.status(201).json({
      scan: {
        ...completedScan,
        images: processedImages.map((img, idx) => ({
          position: idx,
          mimeType: img.mimeType,
          width: img.width,
          height: img.height,
          url: `/api/v1/scans/${scanId}/images/${idx}`,
        })),
        diagnosis: diagnosisResult,
        treatment: treatmentResult,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listScans(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const filter = scanFilterSchema.parse(req.query);

    const data = await withUser(userId, async (client) => {
      const conditions: string[] = ['s.user_id = $1'];
      const params: any[] = [userId];
      let paramIdx = 2;

      if (filter.fieldId) {
        conditions.push(`s.field_id = $${paramIdx++}`);
        params.push(filter.fieldId);
      }
      if (filter.severity) {
        conditions.push(`s.overall_severity = $${paramIdx++}`);
        params.push(filter.severity);
      }
      if (filter.from) {
        conditions.push(`s.created_at >= $${paramIdx++}`);
        params.push(filter.from);
      }
      if (filter.to) {
        conditions.push(`s.created_at <= $${paramIdx++}`);
        params.push(filter.to);
      }
      if (filter.category) {
        conditions.push(
          `EXISTS (SELECT 1 FROM findings f WHERE f.scan_id = s.id AND f.category = $${paramIdx++})`
        );
        params.push(filter.category);
      }

      const whereClause = conditions.join(' AND ');
      const offset = (filter.page - 1) * filter.limit;

      const countRes = await client.query(
        `SELECT COUNT(*) as total FROM scans s WHERE ${whereClause}`,
        params
      );

      const scansRes = await client.query(
        `SELECT s.id, s.field_id, f.name as field_name, s.status, s.crop_name, s.growth_stage,
                s.health_score, s.overall_severity, s.urgency, s.created_at,
                (SELECT COUNT(*)::int FROM findings fn WHERE fn.scan_id = s.id) as finding_count,
                (SELECT COUNT(*)::int FROM scan_images img WHERE img.scan_id = s.id) as image_count
         FROM scans s
         JOIN fields f ON s.field_id = f.id
         WHERE ${whereClause}
         ORDER BY s.created_at DESC
         LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
        [...params, filter.limit, offset]
      );

      return {
        total: parseInt(countRes.rows[0]?.total || '0', 10),
        scans: scansRes.rows,
      };
    });

    res.json({
      page: filter.page,
      limit: filter.limit,
      total: data.total,
      totalPages: Math.ceil(data.total / filter.limit),
      scans: data.scans,
    });
  } catch (err) {
    next(err);
  }
}

export async function getScan(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const data = await withUser(userId, async (client) => {
      const scanRes = await client.query(
        `SELECT s.*, f.name as field_name, f.location as field_location
         FROM scans s
         JOIN fields f ON s.field_id = f.id
         WHERE s.id = $1 AND s.user_id = $2`,
        [id, userId]
      );

      if (scanRes.rows.length === 0) {
        return null;
      }

      const imagesRes = await client.query(
        `SELECT position, mime_type, width, height, byte_size, created_at
         FROM scan_images
         WHERE scan_id = $1 AND user_id = $2
         ORDER BY position ASC`,
        [id, userId]
      );

      const findingsRes = await client.query(
        `SELECT id, image_position, category, name, confidence, severity, evidence, box_x, box_y, box_w, box_h, created_at
         FROM findings
         WHERE scan_id = $1 AND user_id = $2
         ORDER BY image_position ASC, confidence DESC`,
        [id, userId]
      );

      return {
        scan: scanRes.rows[0],
        images: imagesRes.rows.map((img: any) => ({
          ...img,
          url: `/api/v1/scans/${id}/images/${img.position}`,
        })),
        findings: findingsRes.rows,
      };
    });

    if (!data) {
      throw new AppError('Scan not found', 404, 'SCAN_NOT_FOUND');
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function streamScanImage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id, position } = req.params;
    const pos = parseInt(position, 10);

    const img = await withUser(userId, async (client) => {
      const result = await client.query(
        `SELECT mime_type, data
         FROM scan_images
         WHERE scan_id = $1 AND position = $2 AND user_id = $3`,
        [id, pos, userId]
      );
      return result.rows[0];
    });

    if (!img) {
      throw new AppError('Image not found', 404, 'IMAGE_NOT_FOUND');
    }

    res.setHeader('Content-Type', img.mime_type || 'image/webp');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(img.data);
  } catch (err) {
    next(err);
  }
}

export async function deleteScan(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await withUser(userId, async (client) => {
      const result = await client.query(
        'DELETE FROM scans WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );
      return result.rows[0];
    });

    if (!deleted) {
      throw new AppError('Scan not found', 404, 'SCAN_NOT_FOUND');
    }

    res.json({ message: 'Scan deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function reanalyzeScan(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Retrieve scan and images
    const data = await withUser(userId, async (client) => {
      const s = await client.query('SELECT * FROM scans WHERE id = $1 AND user_id = $2', [
        id,
        userId,
      ]);
      if (s.rows.length === 0) return null;

      const imgs = await client.query(
        'SELECT position, mime_type, data FROM scan_images WHERE scan_id = $1 AND user_id = $2 ORDER BY position ASC',
        [id, userId]
      );

      return { scan: s.rows[0], images: imgs.rows };
    });

    if (!data) {
      throw new AppError('Scan not found', 404, 'SCAN_NOT_FOUND');
    }

    const scan = data.scan;
    const images = data.images;

    // Run diagnosis
    const diagnosisResult = await runDiagnosis(
      images.map((img: any) => ({ mimeType: img.mime_type, data: img.data })),
      {
        cropName: scan.crop_name,
        growthStage: scan.growth_stage,
        daysSincePlanting: scan.days_since_planting,
        location: scan.location,
        season: scan.season,
        recentWeather: scan.recent_weather,
        soilType: scan.soil_type,
        irrigationMethod: scan.irrigation_method,
        affectedAreaPercent: scan.affected_area_percent,
        previousTreatments: scan.previous_treatments,
        symptomNotes: scan.symptom_notes,
        language: scan.language,
        imageCount: images.length,
      },
      userId
    );

    // Run treatment plan
    const treatmentResult = await runTreatmentPlan(
      {
        diagnosisJson: diagnosisResult,
        cropName: scan.crop_name,
        growthStage: scan.growth_stage,
        location: scan.location,
        season: scan.season,
        recentWeather: scan.recent_weather,
        irrigationMethod: scan.irrigation_method,
        preferOrganic: scan.prefer_organic,
        previousTreatments: scan.previous_treatments,
        language: scan.language,
      },
      userId
    );

    // Update in DB
    await withUser(userId, async (client) => {
      await client.query('DELETE FROM findings WHERE scan_id = $1 AND user_id = $2', [
        id,
        userId,
      ]);

      await client.query(
        `UPDATE scans
         SET health_score = $1,
             overall_severity = $2,
             urgency = $3,
             diagnosis_json = $4,
             treatment_json = $5,
             updated_at = NOW()
         WHERE id = $6 AND user_id = $7`,
        [
          diagnosisResult.healthScore,
          diagnosisResult.overallSeverity,
          diagnosisResult.urgency,
          JSON.stringify(diagnosisResult),
          JSON.stringify(treatmentResult),
          id,
          userId,
        ]
      );

      for (const finding of diagnosisResult.findings) {
        await client.query(
          `INSERT INTO findings (
            scan_id, user_id, image_position, category, name, confidence,
            severity, evidence, box_x, box_y, box_w, box_h
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            id,
            userId,
            finding.imageIndex,
            finding.category,
            finding.name,
            finding.confidence,
            finding.severity,
            finding.evidence,
            finding.box.x,
            finding.box.y,
            finding.box.w,
            finding.box.h,
          ]
        );
      }
    });

    res.json({
      message: 'Scan re-analyzed successfully',
      diagnosis: diagnosisResult,
      treatment: treatmentResult,
    });
  } catch (err) {
    next(err);
  }
}
