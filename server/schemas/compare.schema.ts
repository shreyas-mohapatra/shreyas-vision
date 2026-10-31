import { z } from 'zod';

export const compareSchema = z
  .object({
    previousScanId: z.string().uuid('Invalid previous scan ID'),
    currentScanId: z.string().uuid('Invalid current scan ID'),
    treatmentsBetween: z.string().trim().max(500).optional(),
  })
  .refine((v) => v.previousScanId !== v.currentScanId, {
    message: 'Scans must differ',
    path: ['currentScanId'],
  });

export const idParam = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const fieldIdParam = z.object({
  fieldId: z.string().uuid('Invalid Field ID format'),
});
