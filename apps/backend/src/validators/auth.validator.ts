/**
 * Authentication Validators
 * Zod schemas for auth request validation
 */

import { z } from 'zod';

/**
 * Password validation regex
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one number
 */
const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;

/**
 * Register schema
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordRegex, 'Password must contain at least one uppercase letter and one number'),
  name: z.string().min(1).max(100).optional(),
});

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  stepGoal: z.number().int().min(1000).max(50000).optional(),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (use HH:MM)')
    .optional(),
  timezone: z.string().optional(),
  theme: z.enum(['light', 'dark']).optional(),
});

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(
      passwordRegex,
      'New password must contain at least one uppercase letter and one number'
    ),
});
