import { Router } from 'express';
import {
  createScan,
  listScans,
  getScan,
  streamScanImage,
  deleteScan,
  reanalyzeScan,
} from '../controllers/scans.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { handleScanImagesUpload } from '../middleware/upload.js';
import { scanCreateLimiter } from '../middleware/rateLimit.js';
import { checkDailyScanQuota } from '../middleware/aiQuota.js';
import { validate } from '../middleware/validate.js';
import { idParam } from '../schemas/compare.schema.js';

const router = Router();

router.use(requireAuth);

router.post('/', scanCreateLimiter, checkDailyScanQuota, handleScanImagesUpload, createScan);
router.get('/', listScans);
router.get('/:id', validate({ params: idParam }), getScan);
router.get('/:id/images/:position', streamScanImage);
router.post('/:id/reanalyze', validate({ params: idParam }), checkDailyScanQuota, reanalyzeScan);
router.delete('/:id', validate({ params: idParam }), deleteScan);

export default router;
