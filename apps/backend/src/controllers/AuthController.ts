/**
 * Auth Controller
 * Handles authentication and user profile endpoints
 */

import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess, sendCreated } from '../utils/response';

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  static register = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);

    sendCreated(res, result, 'User registered successfully');
  });

  /**
   * POST /api/auth/login
   * Login user
   */
  static login = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    sendSuccess(res, result, 'Login successful');
  });

  /**
   * GET /api/auth/me
   * Get current user profile
   */
  static getCurrentUser = catchAsync(async (req: Request, res: Response) => {
    const user = await AuthService.getCurrentUser(req.user!.id);

    sendSuccess(res, { user });
  });

  /**
   * POST /api/auth/logout
   * Logout user (client-side token removal)
   */
  static logout = catchAsync(async (req: Request, res: Response) => {
    // JWT is stateless, so logout is handled on client side
    // This endpoint is here for consistency and future enhancements
    sendSuccess(res, null, 'Logout successful');
  });

  /**
   * PATCH /api/auth/profile
   * Update user profile
   */
  static updateProfile = catchAsync(async (req: Request, res: Response) => {
    const user = await AuthService.updateProfile(req.user!.id, req.body);

    sendSuccess(res, { user }, 'Profile updated successfully');
  });

  /**
   * POST /api/auth/change-password
   * Change user password
   */
  static changePassword = catchAsync(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    await AuthService.changePassword(req.user!.id, currentPassword, newPassword);

    sendSuccess(res, null, 'Password changed successfully');
  });
}
