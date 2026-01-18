import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../utils/AppError';

/**
 * Validation middleware factory using Zod schemas
 *
 * @param schema - Zod validation schema
 * @param source - Request property to validate ('body', 'query', 'params')
 * @returns Express middleware function
 *
 * @example
 * router.post('/users', validate(createUserSchema, 'body'), UserController.create);
 */
export const validate = (
  schema: AnyZodObject,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the specified request property
      const validated = await schema.parseAsync(req[source]);

      // Replace request property with validated data
      req[source] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into user-friendly format
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        throw new ValidationError('Validation failed', errors);
      }

      next(error);
    }
  };
};

/**
 * Combined validation middleware for multiple request properties
 *
 * @param schemas - Object with schemas for different request properties
 * @returns Express middleware function
 *
 * @example
 * router.get('/users/:id',
 *   validateMultiple({
 *     params: getUserParamsSchema,
 *     query: getUserQuerySchema
 *   }),
 *   UserController.getById
 * );
 */
export const validateMultiple = (schemas: {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: Array<{ field: string; message: string; code: string }> = [];

      // Validate each specified schema
      for (const [source, schema] of Object.entries(schemas)) {
        if (schema) {
          try {
            const validated = await schema.parseAsync(
              req[source as keyof typeof schemas]
            );
            req[source as keyof typeof schemas] = validated as any;
          } catch (error) {
            if (error instanceof ZodError) {
              errors.push(
                ...error.errors.map((err) => ({
                  field: `${source}.${err.path.join('.')}`,
                  message: err.message,
                  code: err.code,
                }))
              );
            }
          }
        }
      }

      if (errors.length > 0) {
        throw new ValidationError('Validation failed', errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
