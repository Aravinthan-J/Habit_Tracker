/**
 * Validation Middleware
 * Validates request data using Zod schemas
 */

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../utils/AppError';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validate request data against Zod schema
 * @param schema Zod schema to validate against
 * @param target Which part of request to validate (body, query, params)
 */
export const validate = (schema: AnyZodObject, target: ValidationTarget = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the specified part of the request
      const data = req[target];
      const validated = await schema.parseAsync(data);

      // Replace request data with validated data
      req[target] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw new ValidationError(
          `Validation failed: ${errors.map((e) => e.message).join(', ')}`
        );
      }
      next(error);
    }
  };
};
