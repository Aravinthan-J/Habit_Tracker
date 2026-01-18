import { User } from '@prisma/client';

/**
 * User without sensitive password field
 */
export type SafeUser = Omit<User, 'password'>;

/**
 * JWT payload structure
 */
export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Pagination query parameters
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: SafeUser;
  token: string;
  refreshToken?: string;
}
