/**
 * Habit Validators
 * Zod schemas for habit request validation
 */

import { z } from 'zod';

/**
 * Hex color validation regex
 */
const hexColorRegex = /^#[0-9A-F]{6}$/i;

/**
 * Create habit schema
 */
export const createHabitSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  monthlyGoal: z
    .number()
    .int('Monthly goal must be an integer')
    .min(1, 'Monthly goal must be at least 1')
    .max(31, 'Monthly goal cannot exceed 31'),
  color: z
    .string()
    .regex(hexColorRegex, 'Invalid hex color format (use #RRGGBB)')
    .optional(),
  icon: z.string().max(50).optional(),
  notificationsEnabled: z.boolean().optional(),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (use HH:MM)')
    .optional(),
});

/**
 * Update habit schema
 */
export const updateHabitSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  monthlyGoal: z.number().int().min(1).max(31).optional(),
  color: z.string().regex(hexColorRegex, 'Invalid hex color format').optional(),
  icon: z.string().max(50).optional(),
  notificationsEnabled: z.boolean().optional(),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (use HH:MM)')
    .nullable()
    .optional(),
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
