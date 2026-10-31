import { z } from 'zod';

export const weeklyInsightJsonSchema = {
  type: 'object',
  required: [
    'headline',
    'bestField',
    'attentionField',
    'recurringIssue',
    'weeklyActions',
    'encouragement',
  ],
  properties: {
    headline: { type: 'string' },
    bestField: {
      type: 'object',
      required: ['name', 'note'],
      properties: { name: { type: 'string' }, note: { type: 'string' } },
    },
    attentionField: {
      type: 'object',
      required: ['name', 'note'],
      properties: { name: { type: 'string' }, note: { type: 'string' } },
    },
    recurringIssue: {
      type: 'object',
      required: ['name', 'tip'],
      properties: { name: { type: 'string' }, tip: { type: 'string' } },
    },
    weeklyActions: {
      type: 'array',
      minItems: 1,
      maxItems: 3,
      items: { type: 'string' },
    },
    encouragement: { type: 'string' },
  },
};

export const weeklyInsightSchema = z.object({
  headline: z.string(),
  bestField: z.object({ name: z.string(), note: z.string() }),
  attentionField: z.object({ name: z.string(), note: z.string() }),
  recurringIssue: z.object({ name: z.string(), tip: z.string() }),
  weeklyActions: z.array(z.string()).min(1).max(3),
  encouragement: z.string(),
});

export type WeeklyInsight = z.infer<typeof weeklyInsightSchema>;
