import { z } from 'zod';

export const fieldSchema = z.object({
  name: z.string().trim().min(1, 'Field name is required').max(100),
  cropName: z.string().trim().min(1, 'Crop name is required').max(60),
  cropCategory: z.enum([
    'cereals',
    'pulses',
    'oilseeds',
    'vegetables',
    'fruits',
    'cash_plantation',
    'other',
  ]),
  areaValue: z.coerce.number().positive('Area must be positive').max(100000).optional(),
  areaUnit: z.enum(['acre', 'hectare']).default('acre'),
  location: z.string().trim().min(2, 'Location is required').max(120),
  soilType: z
    .enum(['alluvial', 'black', 'red', 'laterite', 'sandy', 'loamy', 'clayey', 'unknown'])
    .optional(),
  irrigationMethod: z
    .enum(['rainfed', 'drip', 'sprinkler', 'flood', 'furrow', 'unknown'])
    .optional(),
});

export const updateFieldSchema = fieldSchema.partial();
