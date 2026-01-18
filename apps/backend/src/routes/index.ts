import { Router } from 'express';
import authRoutes from './auth.routes';
import habitsRoutes from './habits.routes';
import completionsRoutes from './completions.routes';
import badgesRoutes from './badges.routes';
import stepsRoutes from './steps.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

/**
 * Mount all route modules
 */
router.use('/auth', authRoutes);
router.use('/habits', habitsRoutes);
router.use('/completions', completionsRoutes);
router.use('/badges', badgesRoutes);
router.use('/steps', stepsRoutes);
router.use('/analytics', analyticsRoutes);

/**
 * API info endpoint
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ultimate Monthly Habit Tracker API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      habits: '/api/habits',
      completions: '/api/completions',
      badges: '/api/badges',
      steps: '/api/steps',
      analytics: '/api/analytics',
    },
  });
});

export default router;
