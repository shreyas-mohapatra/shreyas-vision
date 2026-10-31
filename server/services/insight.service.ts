import { generateStructured } from './gemini.js';
import { SYSTEM_PROMPT } from '../prompts/system.js';
import { buildInsightPrompt } from '../prompts/insight.js';
import {
  weeklyInsightJsonSchema,
  weeklyInsightSchema,
  WeeklyInsight,
} from '../schemas/ai/insight.schema.js';
import { withUser } from '../db/withUser.js';

export async function getOrGenerateWeeklyInsight(
  userId: string,
  userLanguage = 'en'
): Promise<WeeklyInsight> {
  // Determine current week start (Monday)
  const now = new Date();
  const day = now.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  const weekStartStr = monday.toISOString().split('T')[0];

  // 1. Check database cache
  const cached = await withUser(userId, async (client) => {
    const res = await client.query(
      `SELECT insight_json FROM weekly_insights WHERE user_id = $1 AND week_start = $2`,
      [userId, weekStartStr]
    );
    return res.rows[0]?.insight_json;
  });

  if (cached) {
    return cached as WeeklyInsight;
  }

  // 2. Compute aggregated stats over past 14 days
  const stats = await withUser(userId, async (client) => {
    const scansRes = await client.query(
      `SELECT s.id, s.health_score, s.overall_severity, s.crop_name, s.created_at, f.name as field_name
       FROM scans s
       JOIN fields f ON s.field_id = f.id
       WHERE s.user_id = $1 AND s.created_at >= NOW() - INTERVAL '14 days'
       ORDER BY s.created_at DESC`,
      [userId]
    );

    const findingsRes = await client.query(
      `SELECT name, category, COUNT(*) as count, MAX(severity) as max_severity
       FROM findings
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '14 days'
       GROUP BY name, category
       ORDER BY count DESC
       LIMIT 5`,
      [userId]
    );

    return {
      totalScans: scansRes.rows.length,
      scans: scansRes.rows,
      topFindings: findingsRes.rows,
    };
  });

  // If no scans recorded, return friendly empty state without calling AI
  if (stats.totalScans === 0) {
    return {
      headline: 'Welcome to AgriLens Visual Crop Monitoring',
      bestField: {
        name: 'No Active Field Scans Yet',
        note: 'Start your first visual scan to establish an agronomic baseline.',
      },
      attentionField: {
        name: 'Initial Inspection Pending',
        note: 'High-resolution leaf and canopy imagery enables early lesion detection.',
      },
      recurringIssue: {
        name: 'None Detected',
        tip: 'Scout crops weekly and inspect under-leaf surfaces for early symptoms.',
      },
      weeklyActions: [
        'Take your first crop photo in natural morning daylight',
        'Review local irrigation schedules based on recent rainfall',
      ],
      encouragement:
        'Regular visual monitoring protects yields and prevents costly input misapplication.',
    };
  }

  // Generate with Gemini
  const prompt = buildInsightPrompt({
    aggregatedStatsJson: stats,
    language: userLanguage,
  });

  const insight = await generateStructured<WeeklyInsight>({
    system: SYSTEM_PROMPT,
    prompt,
    schema: weeklyInsightJsonSchema,
    zodSchema: weeklyInsightSchema,
    temperature: 0.4,
    userId,
    endpoint: 'weekly_insight',
  });

  // Cache in DB
  await withUser(userId, async (client) => {
    await client.query(
      `INSERT INTO weekly_insights (user_id, week_start, insight_json)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, week_start)
       DO UPDATE SET insight_json = EXCLUDED.insight_json`,
      [userId, weekStartStr, JSON.stringify(insight)]
    );
  });

  return insight;
}
