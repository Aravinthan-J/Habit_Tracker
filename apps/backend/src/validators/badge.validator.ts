/**
 * Badge Validators
 * Zod schemas for badge request validation
 */

import { z } from 'zod';

/**
 * Check unlocks schema
 */
export const checkUnlocksSchema = z.object({
  habitId: z.string().uuid('Invalid habit ID').optional(),
});
