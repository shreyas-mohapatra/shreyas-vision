import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from '../schemas/auth.schema.js';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), register);
router.post('/login', authLimiter, validate({ body: loginSchema }), login);
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, validate({ body: updateProfileSchema }), updateProfile);
router.post('/change-password', requireAuth, validate({ body: changePasswordSchema }), changePassword);
router.delete('/me', requireAuth, validate({ body: deleteAccountSchema }), deleteAccount);

export default router;
