/**
 * Auth API Service
 * Handles authentication-related API calls
 */

import { AxiosInstance } from 'axios';
import type {
  RegisterData,
  LoginCredentials,
  AuthResponse,
  User,
  ProfileUpdates,
  ChangePasswordData,
  ApiResponse,
} from '@habit-tracker/shared-types';

export class AuthApiService {
  constructor(private api: AxiosInstance) {}

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    );
    return response.data.data!;
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    return response.data.data!;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data!.user;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: ProfileUpdates): Promise<User> {
    const response = await this.api.patch<ApiResponse<{ user: User }>>(
      '/auth/profile',
      updates
    );
    return response.data.data!.user;
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    await this.api.post('/auth/change-password', data);
  }
}
