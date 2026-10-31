import { z } from 'zod';

export const comparisonJsonSchema = {
  type: 'object',
  required: [
    'status',
    'confidence',
    'healthScoreDelta',
    'affectedAreaTrend',
    'issueTrends',
    'anomalyAlerts',
    'actionsEffective',
    'recommendedAdjustments',
    'summary',
  ],
  properties: {
    status: {
      type: 'string',
      enum: ['improved', 'stable', 'worsening', 'new_issue_detected', 'insufficient_data'],
    },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    healthScoreDelta: { type: 'integer', minimum: -100, maximum: 100 },
    affectedAreaTrend: {
      type: 'string',
      enum: ['shrinking', 'stable', 'expanding', 'unknown'],
    },
    issueTrends: {
      type: 'array',
      maxItems: 8,
      items: {
        type: 'object',
        required: ['name', 'trend', 'note'],
        properties: {
          name: { type: 'string' },
          trend: {
            type: 'string',
            enum: ['resolved', 'improving', 'unchanged', 'worsening', 'new'],
          },
          note: { type: 'string' },
        },
      },
    },
    anomalyAlerts: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'object',
        required: ['title', 'detail', 'severity'],
        properties: {
          title: { type: 'string' },
          detail: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
        },
      },
    },
    actionsEffective: { type: 'string', enum: ['yes', 'partially', 'no', 'unknown'] },
    recommendedAdjustments: { type: 'array', items: { type: 'string' }, maxItems: 5 },
    summary: { type: 'string' },
  },
};

export const comparisonSchema = z.object({
  status: z.enum(['improved', 'stable', 'worsening', 'new_issue_detected', 'insufficient_data']),
  confidence: z.number().min(0).max(1),
  healthScoreDelta: z.number().int().min(-100).max(100),
  affectedAreaTrend: z.enum(['shrinking', 'stable', 'expanding', 'unknown']),
  issueTrends: z
    .array(
      z.object({
        name: z.string(),
        trend: z.enum(['resolved', 'improving', 'unchanged', 'worsening', 'new']),
        note: z.string(),
      })
    )
    .max(8),
  anomalyAlerts: z
    .array(
      z.object({
        title: z.string(),
        detail: z.string(),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
      })
    )
    .max(5),
  actionsEffective: z.enum(['yes', 'partially', 'no', 'unknown']),
  recommendedAdjustments: z.array(z.string()).max(5),
  summary: z.string(),
});

export type ComparisonResult = z.infer<typeof comparisonSchema>;
