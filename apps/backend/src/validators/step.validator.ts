import { z } from 'zod';

/**
 * Schema for logging step data
 */
export const logStepsSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  steps: z.number().int().min(0).max(100000),
  distance: z.number().min(0).max(100000), // meters
  calories: z.number().int().min(0).max(50000).optional(),
  activeMinutes: z.number().int().min(0).max(1440).optional(),
  source: z.enum(['pedometer', 'manual', 'healthkit', 'google_fit']).optional(),
});

/**
 * Schema for getting steps query
 */
export const getStepsQuerySchema = z.object({
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid start date format',
    })
    .optional(),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid end date format',
    })
    .optional(),
});

/**
 * Schema for monthly steps query
 */
export const getMonthlyStepsQuerySchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/, 'Year must be 4 digits')
    .optional(),
  month: z
    .string()
    .regex(/^(1[0-2]|[1-9])$/, 'Month must be 1-12')
    .optional(),
});

/**
 * Schema for date param
 */
export const dateParamSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
});

/**
 * Schema for updating step data
 */
export const updateStepsSchema = z.object({
  steps: z.number().int().min(0).max(100000).optional(),
  distance: z.number().min(0).max(100000).optional(),
  calories: z.number().int().min(0).max(50000).optional(),
  activeMinutes: z.number().int().min(0).max(1440).optional(),
  source: z.enum(['pedometer', 'manual', 'healthkit', 'google_fit']).optional(),
});

export type LogStepsInput = z.infer<typeof logStepsSchema>;
export type GetStepsQuery = z.infer<typeof getStepsQuerySchema>;
export type GetMonthlyStepsQuery = z.infer<typeof getMonthlyStepsQuerySchema>;
export type DateParam = z.infer<typeof dateParamSchema>;
export type UpdateStepsInput = z.infer<typeof updateStepsSchema>;
