import { Request, Response } from 'express';
import { pool } from '../db/pool.js';

export async function healthCheck(_req: Request, res: Response) {
  let dbOk = false;
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      dbOk = true;
    } finally {
      client.release();
    }
  } catch {
    dbOk = false;
  }

  res.json({
    status: 'ok',
    db: dbOk,
    time: new Date().toISOString(),
  });
}

export function getConfigOptions(_req: Request, res: Response) {
  res.json({
    cropCategories: [
      { id: 'cereals', name: 'Cereals & Grains', crops: ['rice', 'wheat', 'maize', 'sorghum', 'millet', 'barley'] },
      { id: 'pulses', name: 'Pulses & Legumes', crops: ['chickpea', 'pigeon pea', 'lentil', 'green gram', 'black gram'] },
      { id: 'oilseeds', name: 'Oilseeds', crops: ['groundnut', 'mustard', 'soybean', 'sunflower', 'sesame'] },
      { id: 'vegetables', name: 'Vegetables', crops: ['tomato', 'potato', 'onion', 'chilli', 'brinjal', 'okra', 'cabbage', 'cauliflower', 'cucumber'] },
      { id: 'fruits', name: 'Fruits & Orchards', crops: ['mango', 'banana', 'citrus', 'grapes', 'pomegranate', 'papaya', 'apple'] },
      { id: 'cash_plantation', name: 'Cash & Plantation Crops', crops: ['cotton', 'sugarcane', 'jute', 'tea', 'coffee', 'rubber'] },
      { id: 'other', name: 'Other', crops: ['other'] },
    ],
    findingCategories: [
      { id: 'fungal_disease', label: 'Fungal Disease', color: '#B4532A' },
      { id: 'bacterial_disease', label: 'Bacterial Disease', color: '#96421E' },
      { id: 'viral_disease', label: 'Viral Disease', color: '#7A2E1B' },
      { id: 'insect_pest', label: 'Insect Pest', color: '#C88A1E' },
      { id: 'mite_pest', label: 'Mite Pest', color: '#DFA437' },
      { id: 'nutrient_deficiency', label: 'Nutrient Deficiency', color: '#AD8964' },
      { id: 'water_stress', label: 'Water Stress', color: '#6B5238' },
      { id: 'heat_or_cold_stress', label: 'Temperature Stress', color: '#B5835A' },
      { id: 'weed_pressure', label: 'Weed Pressure', color: '#8C6D4C' },
      { id: 'physical_damage', label: 'Physical Damage', color: '#524130' },
      { id: 'healthy', label: 'Healthy Tissue', color: '#4E8A57' },
      { id: 'unclear', label: 'Unclear / Inconclusive', color: '#6B5238' },
    ],
    severityLevels: [
      { id: 'none', label: 'None', color: '#4E8A57' },
      { id: 'low', label: 'Low', color: '#74A87C' },
      { id: 'medium', label: 'Medium', color: '#C88A1E' },
      { id: 'high', label: 'High', color: '#B4532A' },
      { id: 'critical', label: 'Critical', color: '#7A2E1B' },
    ],
    urgencyLevels: [
      { id: 'monitor', label: 'Monitor Routine', badge: 'bg-leaf-100 text-leaf-800' },
      { id: 'act_this_week', label: 'Act This Week', badge: 'bg-wheat-100 text-soil-800' },
      { id: 'act_within_48h', label: 'Act Within 48 Hours', badge: 'bg-ochre-100 text-ochre-600' },
      { id: 'act_today', label: 'Urgent: Act Today', badge: 'bg-rust-100 text-rust-600 font-semibold' },
    ],
    growthStages: [
      { id: 'germination', label: 'Germination / Emergence' },
      { id: 'seedling', label: 'Seedling / Early Vegetative' },
      { id: 'vegetative', label: 'Active Vegetative Growth' },
      { id: 'flowering', label: 'Flowering / Bloom' },
      { id: 'fruiting', label: 'Fruiting / Grain Fill' },
      { id: 'maturity', label: 'Maturity / Pre-Harvest' },
      { id: 'post_harvest', label: 'Post-Harvest' },
      { id: 'unknown', label: 'Unknown / Not Specified' },
    ],
    soilTypes: [
      { id: 'alluvial', label: 'Alluvial Soil' },
      { id: 'black', label: 'Black / Regur Soil' },
      { id: 'red', label: 'Red & Yellow Soil' },
      { id: 'laterite', label: 'Laterite Soil' },
      { id: 'sandy', label: 'Sandy Soil' },
      { id: 'loamy', label: 'Loamy Soil' },
      { id: 'clayey', label: 'Clayey Soil' },
      { id: 'unknown', label: 'Unknown' },
    ],
    irrigationMethods: [
      { id: 'rainfed', label: 'Rainfed (No Irrigation)' },
      { id: 'drip', label: 'Drip Micro-Irrigation' },
      { id: 'sprinkler', label: 'Sprinkler System' },
      { id: 'flood', label: 'Flood / Basin Irrigation' },
      { id: 'furrow', label: 'Furrow Irrigation' },
      { id: 'unknown', label: 'Other / Unknown' },
    ],
    seasons: [
      { id: 'kharif', label: 'Kharif (Monsoon / Summer)' },
      { id: 'rabi', label: 'Rabi (Winter)' },
      { id: 'zaid', label: 'Zaid (Spring / Summer)' },
      { id: 'perennial', label: 'Perennial' },
      { id: 'unknown', label: 'Other' },
    ],
    recentWeathers: [
      { id: 'normal', label: 'Normal / Seasonal' },
      { id: 'dry', label: 'Prolonged Dry / Drought' },
      { id: 'humid', label: 'High Humidity / Fog' },
      { id: 'rainy', label: 'Heavy Continuous Rain' },
      { id: 'heatwave', label: 'Extreme Heatwave' },
      { id: 'cold_spell', label: 'Cold Spell / Frost' },
      { id: 'stormy', label: 'Stormy / High Winds' },
    ],
    languages: [
      { id: 'en', label: 'English' },
      { id: 'hi', label: 'हिंदी (Hindi)' },
      { id: 'bn', label: 'বাংলা (Bengali)' },
      { id: 'te', label: 'తెలుగు (Telugu)' },
      { id: 'ta', label: 'தமிழ் (Tamil)' },
      { id: 'mr', label: 'मराठी (Marathi)' },
    ],
  });
}
