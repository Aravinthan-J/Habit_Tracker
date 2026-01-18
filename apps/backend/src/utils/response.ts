import { Response } from 'express';
import { ApiResponse } from '../types';

/**
 * Send standardized success response
 *
 * @param res - Express response object
 * @param data - Response data
 * @param message - Success message
 * @param statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = <T = any>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  };

  res.status(statusCode).json(response);
};

/**
 * Send standardized error response
 *
 * @param res - Express response object
 * @param code - Error code
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 500)
 * @param details - Additional error details
 */
export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode: number = 500,
  details?: any
): void => {
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
 * Send created response (201)
 */
export const sendCreated = <T = any>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): void => {
  sendSuccess(res, data, message, 201);
};

/**
 * Send no content response (204)
 */
export const sendNoContent = (res: Response): void => {
  res.status(204).send();
};
