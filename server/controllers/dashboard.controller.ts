import { Request, Response, NextFunction } from 'express';
import { withUser } from '../db/withUser.js';
import { getOrGenerateWeeklyInsight } from '../services/insight.service.js';

export async function getDashboardSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;

    const summary = await withUser(userId, async (client) => {
      // 1. Total fields
      const fieldsCountRes = await client.query(
        'SELECT COUNT(*)::int as count FROM fields WHERE user_id = $1',
        [userId]
      );
      const totalFields = fieldsCountRes.rows[0]?.count || 0;

      // 2. Total scans & average health score
      const scansStatsRes = await client.query(
        `SELECT COUNT(*)::int as count,
                AVG(health_score) as avg_health
         FROM scans
         WHERE user_id = $1 AND status = 'completed'`,
        [userId]
      );
      const totalScans = scansStatsRes.rows[0]?.count || 0;
      const rawAvg = scansStatsRes.rows[0]?.avg_health;
      const averageHealth =
        rawAvg !== null && rawAvg !== undefined
          ? Math.round(parseFloat(rawAvg) * 10) / 10
          : null;

      // 3. Severity breakdown
      const severityRes = await client.query(
        `SELECT overall_severity as severity, COUNT(*)::int as count
         FROM scans
         WHERE user_id = $1 AND overall_severity IS NOT NULL
         GROUP BY overall_severity`,
        [userId]
      );
      const severityMap: Record<string, number> = {
        none: 0,
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      };
      for (const row of severityRes.rows) {
        if (row.severity) severityMap[row.severity] = row.count;
      }

      // 4. Top recurring findings
      const topIssuesRes = await client.query(
        `SELECT name, category, COUNT(*)::int as count
         FROM findings
         WHERE user_id = $1 AND category != 'healthy'
         GROUP BY name, category
         ORDER BY count DESC
         LIMIT 5`,
        [userId]
      );

      // 5. Recent scans (last 5)
      const recentScansRes = await client.query(
        `SELECT s.id, s.field_id, f.name as field_name, s.crop_name, s.growth_stage,
                s.health_score, s.overall_severity, s.urgency, s.created_at
         FROM scans s
         JOIN fields f ON s.field_id = f.id
         WHERE s.user_id = $1
         ORDER BY s.created_at DESC
         LIMIT 5`,
        [userId]
      );

      const findingsRes = await client.query(
        'SELECT scan_id FROM findings WHERE user_id = $1',
        [userId]
      );

      const recentScans = recentScansRes.rows.map((s: any) => ({
        ...s,
        finding_count: findingsRes.rows.filter((fn: any) => fn.scan_id === s.id).length,
      }));

      // 6. Fields overview with latest health
      const fieldsRes = await client.query(
        `SELECT id, name, crop_name, crop_category, area_value, area_unit, location
         FROM fields
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );

      const allScansRes = await client.query(
        `SELECT id, field_id, health_score, overall_severity, created_at
         FROM scans
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );

      const fieldsOverview = fieldsRes.rows.map((f: any) => {
        const fieldScans = allScansRes.rows.filter((s: any) => s.field_id === f.id);
        const latest = fieldScans[0];
        return {
          ...f,
          latest_health: latest ? latest.health_score : null,
          latest_severity: latest ? latest.overall_severity : null,
          scan_count: fieldScans.length,
        };
      });

      return {
        totalFields,
        totalScans,
        averageHealth,
        severityDistribution: [
          { name: 'Healthy (None)', severity: 'none', count: severityMap.none, color: '#4E8A57' },
          { name: 'Low', severity: 'low', count: severityMap.low, color: '#74A87C' },
          { name: 'Medium', severity: 'medium', count: severityMap.medium, color: '#C88A1E' },
          { name: 'High', severity: 'high', count: severityMap.high, color: '#B4532A' },
          { name: 'Critical', severity: 'critical', count: severityMap.critical, color: '#7A2E1B' },
        ],
        topRecurringIssues: topIssuesRes.rows,
        recentScans,
        fieldsOverview,
      };
    });

    res.json(summary);
  } catch (err) {
    next(err);
  }
}

export async function getWeeklyInsight(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const userLanguage = req.user!.language || 'en';

    const insight = await getOrGenerateWeeklyInsight(userId, userLanguage);
    res.json({ insight });
  } catch (err) {
    next(err);
  }
}
