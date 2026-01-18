import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess, sendCreated } from '../utils/response';
import {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from '../validators/auth.validator';

/**
 * Controller for authentication endpoints
 */
export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  static register = catchAsync(async (req: Request, res: Response) => {
    const data: RegisterInput = req.body;

    const result = await AuthService.register(data);

    sendCreated(res, result, 'Account created successfully');
  });

  /**
   * Login user
   * POST /api/auth/login
   */
  static login = catchAsync(async (req: Request, res: Response) => {
    const data: LoginInput = req.body;

    const result = await AuthService.login(data);

    sendSuccess(res, result, 'Login successful');
  });

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  static getCurrentUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const user = await AuthService.getCurrentUser(userId);

    sendSuccess(res, { user }, 'User retrieved successfully');
  });

  /**
   * Update user profile
   * PATCH /api/auth/profile
   */
  static updateProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data: UpdateProfileInput = req.body;

    const user = await AuthService.updateProfile(userId, data);

    sendSuccess(res, { user }, 'Profile updated successfully');
  });

  /**
   * Change password
   * POST /api/auth/change-password
   */
  static changePassword = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data: ChangePasswordInput = req.body;

    await AuthService.changePassword(userId, data);

    sendSuccess(res, undefined, 'Password changed successfully');
  });

  /**
   * Logout user (client-side token removal)
   * POST /api/auth/logout
   */
  static logout = catchAsync(async (req: Request, res: Response) => {
    // In JWT authentication, logout is typically handled client-side
    // by removing the token from storage
    sendSuccess(res, undefined, 'Logout successful');
  });
}
