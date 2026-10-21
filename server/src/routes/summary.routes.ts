import { Router } from 'express';
import { SummaryController } from '../controllers/summary.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Protect summary route
router.use(requireAuth);

// GET /api/summary
router.get('/', SummaryController.getSummary);

export default router;
