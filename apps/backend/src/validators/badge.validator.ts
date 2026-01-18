import { z } from 'zod';

/**
 * Schema for badge ID param
 */
export const getBadgeParamsSchema = z.object({
  id: z.string().uuid('Invalid badge ID format'),
});

/**
 * Schema for check badges request
 */
export const checkBadgesSchema = z.object({
  habitId: z.string().uuid('Invalid habit ID format').optional(),
});

export type GetBadgeParams = z.infer<typeof getBadgeParamsSchema>;
export type CheckBadgesInput = z.infer<typeof checkBadgesSchema>;
