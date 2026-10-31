import api from './axios.js';

export interface ComparisonData {
  status: 'improved' | 'stable' | 'worsening' | 'new_issue_detected' | 'insufficient_data';
  confidence: number;
  healthScoreDelta: number;
  affectedAreaTrend: 'shrinking' | 'stable' | 'expanding' | 'unknown';
  issueTrends: Array<{
    name: string;
    trend: 'resolved' | 'improving' | 'unchanged' | 'worsening' | 'new';
    note: string;
  }>;
  anomalyAlerts: Array<{
    title: string;
    detail: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  actionsEffective: 'yes' | 'partially' | 'no' | 'unknown';
  recommendedAdjustments: string[];
  summary: string;
}

export async function compareScans(
  fieldId: string,
  payload: { previousScanId: string; currentScanId: string; treatmentsBetween?: string }
): Promise<{ comparison: ComparisonData; cached: boolean }> {
  const res = await api.post(`/fields/${fieldId}/compare`, payload);
  return res.data;
}

export async function listComparisons(fieldId: string): Promise<{ comparisons: any[] }> {
  const res = await api.get(`/fields/${fieldId}/comparisons`);
  return res.data;
}
