import api from './axios.js';

export interface ConfigOptions {
  cropCategories: Array<{ id: string; name: string; crops: string[] }>;
  findingCategories: Array<{ id: string; label: string; color: string }>;
  severityLevels: Array<{ id: string; label: string; color: string }>;
  urgencyLevels: Array<{ id: string; label: string; badge: string }>;
  growthStages: Array<{ id: string; label: string }>;
  soilTypes: Array<{ id: string; label: string }>;
  irrigationMethods: Array<{ id: string; label: string }>;
  seasons: Array<{ id: string; label: string }>;
  recentWeathers: Array<{ id: string; label: string }>;
  languages: Array<{ id: string; label: string }>;
}

export async function getConfigOptions(): Promise<ConfigOptions> {
  const res = await api.get('/config/options');
  return res.data;
}
