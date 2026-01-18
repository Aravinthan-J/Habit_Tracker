import { z } from 'zod';

/**
 * Schema for habit ID param
 */
export const habitIdParamsSchema = z.object({
  id: z.string().uuid('Invalid habit ID format'),
});

/**
 * Schema for trends query
 */
export const trendsQuerySchema = z.object({
  period: z.enum(['week', 'month', '3months', 'year']).optional(),
});

/**
 * Schema for heatmap query
 */
export const heatmapQuerySchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/, 'Year must be 4 digits')
    .optional(),
});

/**
 * Schema for top habits query
 */
export const topHabitsQuerySchema = z.object({
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a number')
    .optional(),
});

export type HabitIdParams = z.infer<typeof habitIdParamsSchema>;
export type TrendsQuery = z.infer<typeof trendsQuerySchema>;
export type HeatmapQuery = z.infer<typeof heatmapQuerySchema>;
export type TopHabitsQuery = z.infer<typeof topHabitsQuerySchema>;
