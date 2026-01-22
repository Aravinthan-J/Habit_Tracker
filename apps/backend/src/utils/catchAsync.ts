/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors and pass to error middleware
 */

import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Wraps an async function and catches any errors
 * @param fn Async function to wrap
 * @returns Wrapped function that catches errors
 */
export const catchAsync = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
