/**
 * Express Type Definitions
 * Extends Express Request to include authenticated user
 */

import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string | null;
      };
    }
  }
}

export {};
