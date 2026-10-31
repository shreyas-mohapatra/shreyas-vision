import { Router } from 'express';
import { getDashboardSummary, getWeeklyInsight } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/summary', getDashboardSummary);
router.get('/insight', getWeeklyInsight);

export default router;
