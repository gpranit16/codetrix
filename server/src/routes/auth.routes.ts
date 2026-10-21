import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { sendOtpSchema, verifyOtpSchema } from '../validators';
import { requireAuth } from '../middleware/auth';

const router = Router();

// POST /api/auth/send-otp
router.post('/send-otp', validateBody(sendOtpSchema), AuthController.sendOtp);

// POST /api/auth/verify-otp
router.post('/verify-otp', validateBody(verifyOtpSchema), AuthController.verifyOtp);

// GET /api/auth/me
router.get('/me', requireAuth, AuthController.getMe);

export default router;
