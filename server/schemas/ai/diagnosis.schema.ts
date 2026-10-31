import { z } from 'zod';

export const diagnosisJsonSchema = {
  type: 'object',
  required: [
    'crop',
    'imageQuality',
    'findings',
    'healthScore',
    'overallSeverity',
    'urgency',
    'spreadRisk',
    'differentials',
    'anomalyFlags',
    'summary',
    'disclaimer',
  ],
  properties: {
    crop: {
      type: 'object',
      required: ['detectedName', 'confidence', 'matchesDeclared'],
      properties: {
        detectedName: { type: 'string' },
        confidence: { type: 'number', minimum: 0, maximum: 1 },
        matchesDeclared: { type: 'boolean' },
      },
    },
    imageQuality: {
      type: 'array',
      items: {
        type: 'object',
        required: ['imageIndex', 'usable', 'blur', 'lighting', 'framing', 'retakeTips'],
        properties: {
          imageIndex: { type: 'integer', minimum: 0, maximum: 3 },
          usable: { type: 'boolean' },
          blur: { type: 'string', enum: ['none', 'mild', 'severe'] },
          lighting: { type: 'string', enum: ['good', 'too_dark', 'too_bright', 'uneven'] },
          framing: { type: 'string', enum: ['good', 'too_far', 'too_close', 'partial'] },
          retakeTips: { type: 'array', items: { type: 'string' }, maxItems: 3 },
        },
      },
    },
    findings: {
      type: 'array',
      maxItems: 8,
      items: {
        type: 'object',
        required: ['category', 'name', 'confidence', 'severity', 'evidence', 'imageIndex', 'box'],
        properties: {
          category: {
            type: 'string',
            enum: [
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
            ],
          },
          name: { type: 'string' },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
          severity: { type: 'string', enum: ['none', 'low', 'medium', 'high', 'critical'] },
          evidence: { type: 'string' },
          imageIndex: { type: 'integer', minimum: 0, maximum: 3 },
          box: {
            type: 'object',
            required: ['x', 'y', 'w', 'h'],
            properties: {
              x: { type: 'number', minimum: 0, maximum: 1 },
              y: { type: 'number', minimum: 0, maximum: 1 },
              w: { type: 'number', minimum: 0, maximum: 1 },
              h: { type: 'number', minimum: 0, maximum: 1 },
            },
          },
        },
      },
    },
    healthScore: { type: 'integer', minimum: 0, maximum: 100 },
    overallSeverity: { type: 'string', enum: ['none', 'low', 'medium', 'high', 'critical'] },
    urgency: { type: 'string', enum: ['monitor', 'act_this_week', 'act_within_48h', 'act_today'] },
    spreadRisk: { type: 'string', enum: ['low', 'medium', 'high'] },
    differentials: {
      type: 'array',
      maxItems: 3,
      items: {
        type: 'object',
        required: ['name', 'howToTellApart'],
        properties: {
          name: { type: 'string' },
          howToTellApart: { type: 'string' },
        },
      },
    },
    anomalyFlags: { type: 'array', maxItems: 5, items: { type: 'string' } },
    summary: { type: 'string' },
    disclaimer: { type: 'string' },
  },
};

const boxSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0).max(1),
  h: z.number().min(0).max(1),
});

export const findingItemSchema = z.object({
  category: z.enum([
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
  ]),
  name: z.string().min(1),
  confidence: z.number().min(0).max(1),
  severity: z.enum(['none', 'low', 'medium', 'high', 'critical']),
  evidence: z.string().min(1),
  imageIndex: z.number().int().min(0).max(3),
  box: boxSchema,
});

export const diagnosisSchema = z
  .object({
    crop: z.object({
      detectedName: z.string(),
      confidence: z.number().min(0).max(1),
      matchesDeclared: z.boolean(),
    }),
    imageQuality: z.array(
      z.object({
        imageIndex: z.number().int().min(0).max(3),
        usable: z.boolean(),
        blur: z.enum(['none', 'mild', 'severe']),
        lighting: z.enum(['good', 'too_dark', 'too_bright', 'uneven']),
        framing: z.enum(['good', 'too_far', 'too_close', 'partial']),
        retakeTips: z.array(z.string()).max(3),
      })
    ),
    findings: z.array(findingItemSchema).max(8),
    healthScore: z.number().int().min(0).max(100),
    overallSeverity: z.enum(['none', 'low', 'medium', 'high', 'critical']),
    urgency: z.enum(['monitor', 'act_this_week', 'act_within_48h', 'act_today']),
    spreadRisk: z.enum(['low', 'medium', 'high']),
    differentials: z
      .array(
        z.object({
          name: z.string(),
          howToTellApart: z.string(),
        })
      )
      .max(3),
    anomalyFlags: z.array(z.string()).max(5),
    summary: z.string(),
    disclaimer: z.string(),
  })
  .superRefine((data, ctx) => {
    // Check bounding boxes
    for (let i = 0; i < data.findings.length; i++) {
      const f = data.findings[i];
      if (f.box.x + f.box.w > 1.001) {
        // Clamp minor floating precision issue if slightly over
        if (f.box.x + f.box.w <= 1.05) {
          f.box.w = Math.max(0.01, 1 - f.box.x);
        } else {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Finding ${i} box x+w (${f.box.x + f.box.w}) exceeds image boundary`,
            path: ['findings', i, 'box'],
          });
        }
      }
      if (f.box.y + f.box.h > 1.001) {
        if (f.box.y + f.box.h <= 1.05) {
          f.box.h = Math.max(0.01, 1 - f.box.y);
        } else {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Finding ${i} box y+h (${f.box.y + f.box.h}) exceeds image boundary`,
            path: ['findings', i, 'box'],
          });
        }
      }
    }

    // Healthy finding rule: if healthy, no other finding with severity above low
    const hasHealthy = data.findings.some((f) => f.category === 'healthy');
    if (hasHealthy) {
      const hasSevere = data.findings.some(
        (f) => f.category !== 'healthy' && ['medium', 'high', 'critical'].includes(f.severity)
      );
      if (hasSevere) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cannot report healthy status alongside high/critical severity findings',
          path: ['findings'],
        });
      }
    }
  });

export type DiagnosisResult = z.infer<typeof diagnosisSchema>;
export type FindingItem = z.infer<typeof findingItemSchema>;
