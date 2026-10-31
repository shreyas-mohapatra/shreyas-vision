import { z } from 'zod';

const actionItemJsonSchema = {
  type: 'object',
  required: ['title', 'detail', 'type', 'priority'],
  properties: {
    title: { type: 'string' },
    detail: { type: 'string' },
    type: {
      type: 'string',
      enum: ['cultural', 'mechanical', 'biological', 'organic', 'chemical'],
    },
    priority: { type: 'integer', minimum: 1, maximum: 6 },
    safetyNote: { type: 'string' },
  },
};

export const treatmentJsonSchema = {
  type: 'object',
  required: [
    'immediate',
    'shortTerm',
    'seasonLong',
    'prevention',
    'monitoring',
    'escalation',
    'yieldRiskIfUntreated',
    'weatherTip',
    'disclaimer',
  ],
  properties: {
    immediate: { type: 'array', items: actionItemJsonSchema, maxItems: 6 },
    shortTerm: { type: 'array', items: actionItemJsonSchema, maxItems: 6 },
    seasonLong: { type: 'array', items: actionItemJsonSchema, maxItems: 6 },
    prevention: { type: 'array', items: actionItemJsonSchema, maxItems: 6 },
    monitoring: {
      type: 'object',
      required: ['rescanInDays', 'watchFor'],
      properties: {
        rescanInDays: { type: 'integer', minimum: 1, maximum: 30 },
        watchFor: { type: 'array', items: { type: 'string' }, maxItems: 5 },
      },
    },
    escalation: { type: 'array', items: { type: 'string' }, maxItems: 4 },
    yieldRiskIfUntreated: {
      type: 'object',
      required: ['level', 'reason'],
      properties: {
        level: { type: 'string', enum: ['low', 'medium', 'high'] },
        reason: { type: 'string' },
      },
    },
    weatherTip: { type: 'string' },
    disclaimer: { type: 'string' },
  },
};

export const actionItemSchema = z.object({
  title: z.string().min(1),
  detail: z.string().min(1),
  type: z.enum(['cultural', 'mechanical', 'biological', 'organic', 'chemical']),
  priority: z.number().int().min(1).max(6),
  safetyNote: z.string().optional(),
});

export const treatmentSchema = z.object({
  immediate: z.array(actionItemSchema).max(6),
  shortTerm: z.array(actionItemSchema).max(6),
  seasonLong: z.array(actionItemSchema).max(6),
  prevention: z.array(actionItemSchema).max(6),
  monitoring: z.object({
    rescanInDays: z.number().int().min(1).max(30),
    watchFor: z.array(z.string()).max(5),
  }),
  escalation: z.array(z.string()).max(4),
  yieldRiskIfUntreated: z.object({
    level: z.enum(['low', 'medium', 'high']),
    reason: z.string(),
  }),
  weatherTip: z.string(),
  disclaimer: z.string(),
});

export type TreatmentPlan = z.infer<typeof treatmentSchema>;
