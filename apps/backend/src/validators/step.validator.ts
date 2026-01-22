/**
 * Step Validators
 * Zod schemas for step request validation
 */

import { z } from 'zod';

/**
 * Log steps schema
 */
export const logStepsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)'),
  steps: z.number().int().min(0, 'Steps must be a positive number'),
  distance: z.number().min(0, 'Distance must be a positive number'),
  calories: z.number().int().min(0).optional(),
  activeMinutes: z.number().int().min(0).optional(),
  source: z.enum(['pedometer', 'manual']).default('manual'),
});

/**
 * Update step goal schema
 */
export const updateStepGoalSchema = z.object({
  stepGoal: z.number().int().min(1000).max(100000),
});
