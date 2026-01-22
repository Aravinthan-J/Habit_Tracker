/**
 * User Types
 * Shared user-related interfaces
 */

export interface User {
  id: string;
  email: string;
  name: string | null;
  stepGoal: number;
  reminderTime: string;
  timezone: string;
  theme: 'light' | 'dark';
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ProfileUpdates {
  name?: string;
  stepGoal?: number;
  reminderTime?: string;
  timezone?: string;
  theme?: 'light' | 'dark';
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
