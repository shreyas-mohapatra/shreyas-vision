import api from './axios.js';

export interface DashboardSummary {
  totalFields: number;
  totalScans: number;
  averageHealth: number | null;
  severityDistribution: Array<{
    name: string;
    severity: string;
    count: number;
    color: string;
  }>;
  topRecurringIssues: Array<{
    name: string;
    category: string;
    count: number;
  }>;
  recentScans: Array<{
    id: string;
    field_id: string;
    field_name: string;
    crop_name: string;
    growth_stage: string;
    health_score: number;
    overall_severity: string;
    urgency: string;
    created_at: string;
    finding_count: number;
  }>;
  fieldsOverview: Array<{
    id: string;
    name: string;
    crop_name: string;
    crop_category: string;
    area_value?: number;
    area_unit: string;
    location: string;
    latest_health?: number | null;
    latest_severity?: string | null;
    scan_count: number;
  }>;
}

export interface WeeklyInsightData {
  headline: string;
  bestField: { name: string; note: string };
  attentionField: { name: string; note: string };
  recurringIssue: { name: string; tip: string };
  weeklyActions: string[];
  encouragement: string;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await api.get('/dashboard/summary');
  return res.data;
}

export async function getWeeklyInsight(): Promise<{ insight: WeeklyInsightData }> {
  const res = await api.get('/dashboard/insight');
  return res.data;
}
