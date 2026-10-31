import { Request, Response, NextFunction } from 'express';
import { withUser } from '../db/withUser.js';
import { AppError } from '../utils/AppError.js';
import { runScanComparison } from '../services/comparison.service.js';

export async function compareScans(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { fieldId } = req.params;
    const { previousScanId, currentScanId, treatmentsBetween } = req.body;

    // Verify both scans belong to the field and the user
    const scansData = await withUser(userId, async (client) => {
      // Check cache first
      const cached = await client.query(
        `SELECT status, comparison_json, created_at
         FROM scan_comparisons
         WHERE previous_scan_id = $1 AND current_scan_id = $2 AND user_id = $3`,
        [previousScanId, currentScanId, userId]
      );

      if (cached.rows.length > 0) {
        return { cached: cached.rows[0].comparison_json };
      }

      // Fetch previous scan
      const prevRes = await client.query(
        `SELECT s.id, s.diagnosis_json, s.created_at, img.mime_type, img.data
         FROM scans s
         JOIN scan_images img ON s.id = img.scan_id AND img.position = 0
         WHERE s.id = $1 AND s.field_id = $2 AND s.user_id = $3`,
        [previousScanId, fieldId, userId]
      );

      // Fetch current scan
      const currRes = await client.query(
        `SELECT s.id, s.diagnosis_json, s.created_at, img.mime_type, img.data
         FROM scans s
         JOIN scan_images img ON s.id = img.scan_id AND img.position = 0
         WHERE s.id = $1 AND s.field_id = $2 AND s.user_id = $3`,
        [currentScanId, fieldId, userId]
      );

      if (prevRes.rows.length === 0 || currRes.rows.length === 0) {
        return null;
      }

      return {
        prev: prevRes.rows[0],
        curr: currRes.rows[0],
      };
    });

    if (!scansData) {
      throw new AppError('One or both scans not found for this field', 404, 'SCAN_NOT_FOUND');
    }

    if ('cached' in scansData && scansData.cached) {
      return res.json({ comparison: scansData.cached, cached: true });
    }

    const { prev, curr } = scansData;

    const prevDate = new Date(prev.created_at);
    const currDate = new Date(curr.created_at);
    const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
    const daysBetween = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const comparisonResult = await runScanComparison(
      { mimeType: prev.mime_type, data: prev.data },
      { mimeType: curr.mime_type, data: curr.data },
      {
        daysBetween,
        prevDate: prevDate.toISOString().split('T')[0],
        currDate: currDate.toISOString().split('T')[0],
        prevDiagnosisJson: prev.diagnosis_json,
        currDiagnosisJson: curr.diagnosis_json,
        treatmentsBetween,
        language: req.user!.language || 'en',
      },
      userId
    );

    // Save to cache
    await withUser(userId, async (client) => {
      await client.query(
        `INSERT INTO scan_comparisons (user_id, field_id, previous_scan_id, current_scan_id, status, comparison_json)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (previous_scan_id, current_scan_id)
         DO UPDATE SET comparison_json = EXCLUDED.comparison_json, status = EXCLUDED.status`,
        [
          userId,
          fieldId,
          previousScanId,
          currentScanId,
          comparisonResult.status,
          JSON.stringify(comparisonResult),
        ]
      );
    });

    res.json({ comparison: comparisonResult, cached: false });
  } catch (err) {
    next(err);
  }
}

export async function listComparisons(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { fieldId } = req.params;

    const comparisons = await withUser(userId, async (client) => {
      const result = await client.query(
        `SELECT id, previous_scan_id, current_scan_id, status, comparison_json, created_at
         FROM scan_comparisons
         WHERE field_id = $1 AND user_id = $2
         ORDER BY created_at DESC`,
        [fieldId, userId]
      );
      return result.rows;
    });

    res.json({ comparisons });
  } catch (err) {
    next(err);
  }
}
