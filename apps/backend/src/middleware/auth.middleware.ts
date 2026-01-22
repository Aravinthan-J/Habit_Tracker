/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { UnauthorizedError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

/**
 * Authenticate middleware
 * Verifies JWT token from Authorization header
 */
export const authenticate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // 2. Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw new UnauthorizedError('Token verification failed');
    }

    // 3. Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    // 4. Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    next();
  }
);
