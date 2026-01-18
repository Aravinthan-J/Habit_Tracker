import { Request, Response, NextFunction } from 'express';

/**
 * Type for async route handlers
 */
type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Wrapper for async route handlers to catch errors and pass to error middleware
 *
 * @param fn - Async route handler function
 * @returns Express middleware function with error handling
 *
 * @example
 * router.get('/users', catchAsync(async (req, res) => {
 *   const users = await UserService.getAll();
 *   res.json({ users });
 * }));
 */
export const catchAsync = (fn: AsyncRouteHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
