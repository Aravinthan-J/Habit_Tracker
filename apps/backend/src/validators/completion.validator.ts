import { z } from 'zod';

/**
 * Date format validation (YYYY-MM-DD)
 */
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate date string and ensure it's a valid date
 */
const dateStringSchema = z
  .string()
  .regex(dateRegex, 'Date must be in YYYY-MM-DD format')
  .refine(
    (dateStr) => {
      const date = new Date(dateStr);
      return !isNaN(date.getTime()) && dateStr === date.toISOString().split('T')[0];
    },
    { message: 'Invalid date value' }
  );

/**
 * Create completion validation schema
 */
export const createCompletionSchema = z.object({
  habitId: z.string().uuid('Invalid habit ID'),
  date: dateStringSchema,
});

/**
 * Delete completion params schema
 */
export const deleteCompletionParamsSchema = z.object({
  habitId: z.string().uuid('Invalid habit ID'),
  date: dateStringSchema,
});

/**
 * Get completions query schema
 */
export const getCompletionsQuerySchema = z.object({
  habitId: z.string().uuid().optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
});

/**
 * Get monthly calendar params schema
 */
export const getMonthlyCalendarParamsSchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/, 'Year must be a 4-digit number')
    .transform((val) => parseInt(val, 10))
    .refine((year) => year >= 2000 && year <= 2100, {
      message: 'Year must be between 2000 and 2100',
    }),
  month: z
    .string()
    .regex(/^(0?[1-9]|1[0-2])$/, 'Month must be between 1 and 12')
    .transform((val) => parseInt(val, 10))
    .refine((month) => month >= 1 && month <= 12, {
      message: 'Month must be between 1 and 12',
    }),
});

/**
 * Type exports for TypeScript
 */
export type CreateCompletionInput = z.infer<typeof createCompletionSchema>;
export type DeleteCompletionParams = z.infer<typeof deleteCompletionParamsSchema>;
export type GetCompletionsQuery = z.infer<typeof getCompletionsQuerySchema>;
export type GetMonthlyCalendarParams = z.infer<typeof getMonthlyCalendarParamsSchema>;
