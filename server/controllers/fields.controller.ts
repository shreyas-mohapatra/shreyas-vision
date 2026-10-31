import { Request, Response, NextFunction } from 'express';
import { withUser } from '../db/withUser.js';
import { AppError } from '../utils/AppError.js';

export async function listFields(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;

    const fields = await withUser(userId, async (client) => {
      const fieldsResult = await client.query(
        `SELECT id, name, crop_name, crop_category, area_value, area_unit,
                location, soil_type, irrigation_method, created_at, updated_at
         FROM fields
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );

      const scansResult = await client.query(
        `SELECT id, field_id, health_score, overall_severity, created_at
         FROM scans
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );

      return fieldsResult.rows.map((f: any) => {
        const fieldScans = scansResult.rows.filter((s: any) => s.field_id === f.id);
        const latestScan = fieldScans[0];
        return {
          ...f,
          scan_count: fieldScans.length,
          latest_health_score: latestScan ? latestScan.health_score : null,
          latest_severity: latestScan ? latestScan.overall_severity : null,
          latest_scan_date: latestScan ? latestScan.created_at : null,
        };
      });
    });

    res.json({ fields });
  } catch (err) {
    next(err);
  }
}

export async function createField(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const {
      name,
      cropName,
      cropCategory,
      areaValue,
      areaUnit,
      location,
      soilType,
      irrigationMethod,
    } = req.body;

    const field = await withUser(userId, async (client) => {
      const result = await client.query(
        `INSERT INTO fields (user_id, name, crop_name, crop_category, area_value, area_unit, location, soil_type, irrigation_method)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, name, crop_name, crop_category, area_value, area_unit, location, soil_type, irrigation_method, created_at`,
        [
          userId,
          name,
          cropName,
          cropCategory,
          areaValue || null,
          areaUnit || 'acre',
          location,
          soilType || null,
          irrigationMethod || null,
        ]
      );
      return result.rows[0];
    });

    res.status(201).json({ field });
  } catch (err) {
    next(err);
  }
}

export async function getField(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const data = await withUser(userId, async (client) => {
      const fieldRes = await client.query(
        `SELECT id, name, crop_name, crop_category, area_value, area_unit, location, soil_type, irrigation_method, created_at, updated_at
         FROM fields
         WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );

      if (fieldRes.rows.length === 0) {
        return null;
      }

      // Health trends & scan timeline
      const timelineRes = await client.query(
        `SELECT id, crop_name, growth_stage, health_score, overall_severity, urgency, created_at
         FROM scans
         WHERE field_id = $1 AND user_id = $2
         ORDER BY created_at ASC`,
        [id, userId]
      );

      const findingsRes = await client.query(
        `SELECT scan_id FROM findings WHERE user_id = $1`,
        [userId]
      );

      const trend = timelineRes.rows.map((s: any) => {
        const count = findingsRes.rows.filter((fn: any) => fn.scan_id === s.id).length;
        return {
          ...s,
          finding_count: count,
        };
      });

      return {
        field: fieldRes.rows[0],
        trend,
      };
    });

    if (!data) {
      throw new AppError('Field not found', 404, 'FIELD_NOT_FOUND');
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateField(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const {
      name,
      cropName,
      cropCategory,
      areaValue,
      areaUnit,
      location,
      soilType,
      irrigationMethod,
    } = req.body;

    const updated = await withUser(userId, async (client) => {
      const result = await client.query(
        `UPDATE fields
         SET name = COALESCE($1, name),
             crop_name = COALESCE($2, crop_name),
             crop_category = COALESCE($3, crop_category),
             area_value = COALESCE($4, area_value),
             area_unit = COALESCE($5, area_unit),
             location = COALESCE($6, location),
             soil_type = COALESCE($7, soil_type),
             irrigation_method = COALESCE($8, irrigation_method),
             updated_at = NOW()
         WHERE id = $9 AND user_id = $10
         RETURNING id, name, crop_name, crop_category, area_value, area_unit, location, soil_type, irrigation_method, updated_at`,
        [
          name || null,
          cropName || null,
          cropCategory || null,
          areaValue !== undefined ? areaValue : null,
          areaUnit || null,
          location || null,
          soilType || null,
          irrigationMethod || null,
          id,
          userId,
        ]
      );

      return result.rows[0];
    });

    if (!updated) {
      throw new AppError('Field not found', 404, 'FIELD_NOT_FOUND');
    }

    res.json({ field: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteField(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await withUser(userId, async (client) => {
      const result = await client.query(
        'DELETE FROM fields WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );
      return result.rows[0];
    });

    if (!deleted) {
      throw new AppError('Field not found', 404, 'FIELD_NOT_FOUND');
    }

    res.json({ message: 'Field deleted successfully' });
  } catch (err) {
    next(err);
  }
}
