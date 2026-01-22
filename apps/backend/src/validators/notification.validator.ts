/**
 * Notification Validators
 * Zod schemas for notification request validation
 */

import { z } from 'zod';

/**
 * Register token schema
 */
export const registerTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  platform: z.enum(['ios', 'android'], {
    errorMap: () => ({ message: 'Platform must be ios or android' }),
  }),
  deviceId: z.string().optional(),
});

/**
 * Unregister token schema
 */
export const unregisterTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});
