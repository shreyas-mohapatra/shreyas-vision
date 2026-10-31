import { Router } from 'express';
import { healthCheck, getConfigOptions } from '../controllers/meta.controller.js';

const router = Router();

router.get('/health', healthCheck);
router.get('/config/options', getConfigOptions);

export default router;
