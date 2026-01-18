import { AxiosInstance } from 'axios';
import {
  RegisterData,
  LoginCredentials,
  AuthResponse,
  User,
  ProfileUpdates,
  ChangePasswordData,
} from '@habit-tracker/shared-types';
import { ApiService } from './ApiService';

/**
 * Authentication API service
 */
export class AuthApiService extends ApiService {
  constructor(axios: AxiosInstance) {
    super(axios);
  }

  /**
   * Register a new user
   *
   * @param data - Registration data
   * @returns Auth response with user and token
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/register', data);
  }

  /**
   * Login user
   *
   * @param credentials - Login credentials
   * @returns Auth response with user and token
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', credentials);
  }

  /**
   * Get current authenticated user
   *
   * @returns Current user data
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.get<{ user: User }>('/auth/me');
    return response.user;
  }

  /**
   * Update user profile
   *
   * @param updates - Profile updates
   * @returns Updated user data
   */
  async updateProfile(updates: ProfileUpdates): Promise<User> {
    const response = await this.patch<{ user: User }>('/auth/profile', updates);
    return response.user;
  }

  /**
   * Change user password
   *
   * @param data - Password change data
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    await this.post<void>('/auth/change-password', data);
  }

  /**
   * Logout user (client-side token removal)
   */
  async logout(): Promise<void> {
    await this.post<void>('/auth/logout');
  }
}
