import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { config } from '../config/env';
import { ApiResponse } from '../types';

/**
 * Global error handling middleware
 * Must be registered last in the middleware chain
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details: any = undefined;

  // Handle AppError instances
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  }
  // Handle Prisma errors
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    ({ statusCode, code, message, details } = handlePrismaError(error));
  }
  // Handle Prisma validation errors
  else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid data provided';
    details = config.isDevelopment ? error.message : undefined;
  }
  // Handle generic errors
  else {
    message = error.message || message;
    details = config.isDevelopment ? { stack: error.stack } : undefined;
  }

  // Log error in development
  if (config.isDevelopment) {
    console.error('❌ Error:', {
      statusCode,
      code,
      message,
      details,
      stack: error.stack,
    });
  } else {
    // Log only operational errors in production
    if (error instanceof AppError && !error.isOperational) {
      console.error('❌ Non-operational error:', {
        message: error.message,
        stack: error.stack,
      });
    }
  }

  // Send error response
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  res.status(statusCode).json(response);
};

/**
 * Convert Prisma errors to application errors
 */
const handlePrismaError = (
  error: Prisma.PrismaClientKnownRequestError
): {
  statusCode: number;
  code: string;
  message: string;
  details?: any;
} => {
  switch (error.code) {
    // Unique constraint violation
    case 'P2002': {
      const field = (error.meta?.target as string[])?.join(', ') || 'field';
      return {
        statusCode: 409,
        code: 'CONFLICT',
        message: `A record with this ${field} already exists`,
        details: config.isDevelopment ? error.meta : undefined,
      };
    }

    // Foreign key constraint violation
    case 'P2003': {
      return {
        statusCode: 400,
        code: 'INVALID_REFERENCE',
        message: 'Referenced record does not exist',
        details: config.isDevelopment ? error.meta : undefined,
      };
    }

    // Record not found
    case 'P2025': {
      return {
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Record not found',
        details: config.isDevelopment ? error.meta : undefined,
      };
    }

    // Invalid data type
    case 'P2006':
    case 'P2007': {
      return {
        statusCode: 400,
        code: 'INVALID_DATA',
        message: 'Invalid data provided',
        details: config.isDevelopment ? error.meta : undefined,
      };
    }

    // Database connection error
    case 'P1001':
    case 'P1002':
    case 'P1008': {
      return {
        statusCode: 503,
        code: 'DATABASE_ERROR',
        message: 'Database connection error',
        details: config.isDevelopment ? error.message : undefined,
      };
    }

    // Default Prisma error
    default: {
      return {
        statusCode: 500,
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
        details: config.isDevelopment
          ? { code: error.code, meta: error.meta }
          : undefined,
      };
    }
  }
};
