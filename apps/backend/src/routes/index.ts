import { Router } from 'express';
import authRoutes from './auth.routes';
import habitsRoutes from './habits.routes';
import completionsRoutes from './completions.routes';

const router = Router();

/**
 * Mount all route modules
 */
router.use('/auth', authRoutes);
router.use('/habits', habitsRoutes);
router.use('/completions', completionsRoutes);

/**
 * API info endpoint
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ultimate Monthly Habit Tracker API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      habits: '/api/habits',
      completions: '/api/completions',
    },
  });
});

export default router;
