import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { JwtPayload } from '../types';
import { UnauthorizedError } from '../utils/AppError';

/**
 * Service for handling JWT token operations
 */
export class TokenService {
  /**
   * Generate access token for a user
   *
   * @param userId - User ID
   * @param email - User email
   * @returns JWT access token
   */
  static generateToken(userId: string, email: string): string {
    const payload: JwtPayload = {
      userId,
      email,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Generate refresh token for a user
   *
   * @param userId - User ID
   * @param email - User email
   * @returns JWT refresh token
   */
  static generateRefreshToken(userId: string, email: string): string {
    const payload: JwtPayload = {
      userId,
      email,
    };

    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  /**
   * Verify and decode access token
   *
   * @param token - JWT access token
   * @returns Decoded token payload
   * @throws UnauthorizedError if token is invalid
   */
  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw new UnauthorizedError('Token verification failed');
    }
  }

  /**
   * Verify and decode refresh token
   *
   * @param token - JWT refresh token
   * @returns Decoded token payload
   * @throws UnauthorizedError if token is invalid
   */
  static verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Refresh token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw new UnauthorizedError('Refresh token verification failed');
    }
  }

  /**
   * Decode token without verification (for debugging)
   *
   * @param token - JWT token
   * @returns Decoded token payload or null
   */
  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }
}
