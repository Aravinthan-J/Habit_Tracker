/**
 * Completion Validators
 * Zod schemas for completion request validation
 */

import { z } from 'zod';

/**
 * Date format validation (YYYY-MM-DD)
 */
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Create completion schema
 */
export const createCompletionSchema = z.object({
  habitId: z.string().uuid('Invalid habit ID format'),
  date: z
    .string()
    .regex(dateRegex, 'Invalid date format (use YYYY-MM-DD)')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid date'),
});

/**
 * Get completions query schema
 */
export const getCompletionsQuerySchema = z.object({
  habitId: z.string().uuid().optional(),
  startDate: z
    .string()
    .regex(dateRegex, 'Invalid start date format (use YYYY-MM-DD)')
    .optional(),
  endDate: z
    .string()
    .regex(dateRegex, 'Invalid end date format (use YYYY-MM-DD)')
    .optional(),
});

/**
 * Calendar params schema
 */
export const calendarParamsSchema = z.object({
  year: z.string().regex(/^\d{4}$/, 'Invalid year format').transform(Number),
  month: z
    .string()
    .regex(/^(0?[1-9]|1[0-2])$/, 'Invalid month format (use 1-12)')
    .transform(Number),
});
