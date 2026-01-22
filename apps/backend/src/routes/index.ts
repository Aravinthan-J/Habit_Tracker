/**
 * Routes Index
 * Combines all route modules
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
import habitsRoutes from './habits.routes';
import completionsRoutes from './completions.routes';
import badgesRoutes from './badges.routes';
import analyticsRoutes from './analytics.routes';
import notificationsRoutes from './notifications.routes';
import stepsRoutes from './steps.routes';

const router = Router();

/**
 * Mount routes
 */
router.use('/auth', authRoutes);
router.use('/habits', habitsRoutes);
router.use('/completions', completionsRoutes);
router.use('/badges', badgesRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/steps', stepsRoutes);

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
