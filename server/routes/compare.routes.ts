import { Router } from 'express';
import { compareScans, listComparisons } from '../controllers/compare.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { compareSchema, fieldIdParam } from '../schemas/compare.schema.js';

const router = Router();

router.use(requireAuth);

router.post(
  '/:fieldId/compare',
  validate({ params: fieldIdParam, body: compareSchema }),
  compareScans
);
router.get('/:fieldId/comparisons', validate({ params: fieldIdParam }), listComparisons);

export default router;
