import api from './axios.js';

export interface Field {
  id: string;
  name: string;
  crop_name: string;
  crop_category: string;
  area_value?: number;
  area_unit: 'acre' | 'hectare';
  location: string;
  soil_type?: string;
  irrigation_method?: string;
  created_at: string;
  updated_at: string;
  scan_count?: number;
  latest_health_score?: number | null;
  latest_severity?: string | null;
  latest_scan_date?: string | null;
}

export interface FieldDetailResponse {
  field: Field;
  trend: Array<{
    id: string;
    crop_name: string;
    growth_stage: string;
    health_score: number;
    overall_severity: string;
    urgency: string;
    created_at: string;
    finding_count: number;
  }>;
}

export async function listFields(): Promise<{ fields: Field[] }> {
  const res = await api.get('/fields');
  return res.data;
}

export async function createField(data: Partial<Field>): Promise<{ field: Field }> {
  const res = await api.post('/fields', data);
  return res.data;
}

export async function getField(id: string): Promise<FieldDetailResponse> {
  const res = await api.get(`/fields/${id}`);
  return res.data;
}

export async function updateField(id: string, data: Partial<Field>): Promise<{ field: Field }> {
  const res = await api.patch(`/fields/${id}`, data);
  return res.data;
}

export async function deleteField(id: string): Promise<{ message: string }> {
  const res = await api.delete(`/fields/${id}`);
  return res.data;
}
