/**
 * Token Service
 * Handles JWT token generation and verification
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
}

export class TokenService {
  /**
   * Generate JWT access token
   * @param userId User ID to encode in token
   * @returns JWT token string
   */
  static generateToken(userId: string): string {
    const payload: TokenPayload = { userId };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRY,
    } as SignOptions);
  }

  /**
   * Verify JWT token
   * @param token JWT token to verify
   * @returns Decoded payload
   */
  static verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload & {
        iat: number;
        exp: number;
      };

      return {
        userId: decoded.userId,
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Generate refresh token (30-day expiry)
   * @param userId User ID to encode in token
   * @returns Refresh token string
   */
  static generateRefreshToken(userId: string): string {
    const payload: TokenPayload = { userId };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: '30d',
    } as SignOptions);
  }
}
