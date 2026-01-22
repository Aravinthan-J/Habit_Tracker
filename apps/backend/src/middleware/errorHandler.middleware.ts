/**
 * Global Error Handler Middleware
 * Catches all errors and sends standardized error responses
 */

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/response';
import { env } from '../config/env';

/**
 * Handle Prisma errors
 */
function handlePrismaError(error: any): AppError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      const field = (error.meta?.target as string[])?.join(', ') || 'field';
      return new AppError(`${field} already exists`, 409, 'CONFLICT');
    }

    // Record not found
    if (error.code === 'P2025') {
      return new AppError('Record not found', 404, 'NOT_FOUND');
    }

    // Foreign key constraint failed
    if (error.code === 'P2003') {
      return new AppError('Related record not found', 404, 'NOT_FOUND');
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new AppError('Invalid data provided', 400, 'VALIDATION_ERROR');
  }

  return new AppError('Database error', 500, 'DATABASE_ERROR');
}

/**
 * Global error handler
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  // Convert Prisma errors to AppError
  if (err.name === 'PrismaClientKnownRequestError' ||
      err.name === 'PrismaClientValidationError') {
    error = handlePrismaError(err);
  }

  // Default to AppError
  if (!(error instanceof AppError)) {
    error = new AppError(
      env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }

  const appError = error as AppError;

  // Log error in development
  if (env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      stack: appError.stack,
    });
  }

  // Send error response
  sendError(
    res,
    appError.message,
    appError.code,
    appError.statusCode,
    env.NODE_ENV === 'development' ? { stack: appError.stack } : undefined
  );
};

/**
 * Handle 404 routes
 */
export const notFoundHandler = (req: Request, res: Response) => {
  sendError(res, `Route ${req.originalUrl} not found`, 'NOT_FOUND', 404);
};
