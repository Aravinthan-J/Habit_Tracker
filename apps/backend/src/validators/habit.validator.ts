import { z } from 'zod';

/**
 * Hex color validation regex
 */
const hexColorRegex = /^#([A-Fa-f0-9]{6})$/;

/**
 * Time format validation regex (HH:MM)
 */
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Create habit validation schema
 */
export const createHabitSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  monthlyGoal: z
    .number()
    .int('Monthly goal must be an integer')
    .min(1, 'Monthly goal must be at least 1')
    .max(31, 'Monthly goal cannot exceed 31')
    .default(20),
  color: z
    .string()
    .regex(hexColorRegex, 'Color must be a valid hex code (#RRGGBB)')
    .default('#4CAF50'),
  icon: z.string().min(1, 'Icon is required').default('check-circle'),
  notificationsEnabled: z.boolean().default(true),
  reminderTime: z
    .string()
    .regex(timeRegex, 'Reminder time must be in HH:MM format')
    .optional()
    .nullable(),
});

/**
 * Update habit validation schema
 * All fields are optional for partial updates
 */
export const updateHabitSchema = z.object({
  title: z.string().min(1).max(100).trim().optional(),
  monthlyGoal: z.number().int().min(1).max(31).optional(),
  color: z.string().regex(hexColorRegex).optional(),
  icon: z.string().min(1).optional(),
  notificationsEnabled: z.boolean().optional(),
  reminderTime: z.string().regex(timeRegex).optional().nullable(),
});

/**
 * Get habit by ID params schema
 */
export const getHabitParamsSchema = z.object({
  id: z.string().uuid('Invalid habit ID'),
});

/**
 * Get habits query schema
 */
export const getHabitsQuerySchema = z.object({
  archived: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

/**
 * Type exports for TypeScript
 */
export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type GetHabitParams = z.infer<typeof getHabitParamsSchema>;
export type GetHabitsQuery = z.infer<typeof getHabitsQuerySchema>;
