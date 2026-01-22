/**
 * Analytics Routes
 * /api/analytics
 */

import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * All analytics routes require authentication
 */
router.use(authenticate);

router.get('/overview', AnalyticsController.getOverview);
router.get('/trends', AnalyticsController.getTrends);
router.get('/insights', AnalyticsController.getInsights);

export default router;
