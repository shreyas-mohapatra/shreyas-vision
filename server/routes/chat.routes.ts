import { Router } from 'express';
import { getScanChat, sendScanChatMessage } from '../controllers/chat.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { checkDailyChatQuota } from '../middleware/aiQuota.js';
import { idParam } from '../schemas/compare.schema.js';
import { chatSchema } from '../schemas/chat.schema.js';

const router = Router();

router.use(requireAuth);

router.get('/:id/chat', validate({ params: idParam }), getScanChat);
router.post(
  '/:id/chat',
  validate({ params: idParam, body: chatSchema }),
  checkDailyChatQuota,
  sendScanChatMessage
);

export default router;
