import api from './axios.js';

export interface ScanFinding {
  id: string;
  image_position: number;
  category: string;
  name: string;
  confidence: number;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  evidence: string;
  box_x: number;
  box_y: number;
  box_w: number;
  box_h: number;
  created_at: string;
}

export interface ScanImageMeta {
  position: number;
  mime_type: string;
  width: number;
  height: number;
  byte_size?: number;
  url: string;
}

export interface ScanDetail {
  id: string;
  field_id: string;
  field_name?: string;
  field_location?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  crop_name: string;
  growth_stage: string;
  days_since_planting?: number;
  location: string;
  soil_type?: string;
  irrigation_method?: string;
  season?: string;
  recent_weather?: string;
  affected_area_percent?: number;
  symptom_notes?: string;
  previous_treatments?: string;
  prefer_organic: boolean;
  language: string;
  health_score: number;
  overall_severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  urgency: 'monitor' | 'act_this_week' | 'act_within_48h' | 'act_today';
  diagnosis_json: any;
  treatment_json: any;
  model_used?: string;
  created_at: string;
}

export interface ScanDetailResponse {
  scan: ScanDetail;
  images: ScanImageMeta[];
  findings: ScanFinding[];
}

export interface ScanListResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  scans: Array<ScanDetail & { field_name: string; finding_count: number; image_count: number }>;
}

export async function createScan(formData: FormData): Promise<{ scan: ScanDetailResponse }> {
  const res = await api.post('/scans', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

export async function listScans(params?: any): Promise<ScanListResponse> {
  const res = await api.get('/scans', { params });
  return res.data;
}

export async function getScan(id: string): Promise<ScanDetailResponse> {
  const res = await api.get(`/scans/${id}`);
  return res.data;
}

export async function reanalyzeScan(id: string): Promise<any> {
  const res = await api.post(`/scans/${id}/reanalyze`);
  return res.data;
}

export async function deleteScan(id: string): Promise<{ message: string }> {
  const res = await api.delete(`/scans/${id}`);
  return res.data;
}
