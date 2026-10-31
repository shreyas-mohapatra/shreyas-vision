import { z } from 'zod';

export const scanPayloadSchema = z.object({
  fieldId: z.string().uuid('Invalid field identifier'),
  cropName: z.string().trim().min(1, 'Crop name is required').max(60),
  growthStage: z.enum([
    'germination',
    'seedling',
    'vegetative',
    'flowering',
    'fruiting',
    'maturity',
    'post_harvest',
    'unknown',
  ]),
  daysSincePlanting: z.coerce.number().int().min(0).max(400).optional(),
  location: z.string().trim().min(2, 'Location is required').max(120),
  soilType: z.string().max(30).optional(),
  irrigationMethod: z.string().max(30).optional(),
  season: z.enum(['kharif', 'rabi', 'zaid', 'perennial', 'unknown']).optional(),
  recentWeather: z
    .enum(['dry', 'humid', 'rainy', 'heatwave', 'cold_spell', 'stormy', 'normal'])
    .optional(),
  affectedAreaPercent: z.coerce.number().int().min(0).max(100).optional(),
  symptomNotes: z.string().trim().max(1000).optional(),
  previousTreatments: z.string().trim().max(500).optional(),
  preferOrganic: z.coerce.boolean().default(true),
  language: z.enum(['en', 'hi', 'bn', 'te', 'ta', 'mr']).default('en'),
});

export const scanFilterSchema = z.object({
  fieldId: z.string().uuid().optional(),
  severity: z.enum(['none', 'low', 'medium', 'high', 'critical']).optional(),
  category: z
    .enum([
      'fungal_disease',
      'bacterial_disease',
      'viral_disease',
      'insect_pest',
      'mite_pest',
      'nutrient_deficiency',
      'water_stress',
      'heat_or_cold_stress',
      'weed_pressure',
      'physical_damage',
      'healthy',
      'unclear',
    ])
    .optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
