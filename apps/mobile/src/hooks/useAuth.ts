/**
 * useAuth Hook
 * Authentication hook with mutations for login, register, logout
 */

import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api/apiClient';
import { SecureStorageService } from '../services/storage/SecureStorageService';
import type {
  LoginCredentials,
  RegisterData,
} from '@habit-tracker/shared-types';

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, setAuth, clearAuth } =
    useAuthStore();

  /**
   * Login mutation
   */
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.auth.login(credentials);
      return response;
    },
    onSuccess: async (data) => {
      // Save to secure storage
      await SecureStorageService.saveToken(data.token);
      await SecureStorageService.saveUser(data.user);

      // Update auth store
      setAuth(data.user, data.token);

      // Update API client with token
      api.setToken(data.token);
    },
  });

  /**
   * Register mutation
   */
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.auth.register(data);
      return response;
    },
    onSuccess: async (data) => {
      // Save to secure storage
      await SecureStorageService.saveToken(data.token);
      await SecureStorageService.saveUser(data.user);

      // Update auth store
      setAuth(data.user, data.token);

      // Update API client with token
      api.setToken(data.token);
    },
  });

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      // Call API logout (optional)
      if (token) {
        await api.auth.logout();
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear storage
      await SecureStorageService.clearAll();

      // Clear auth store
      clearAuth();

      // Clear API token
      api.clearToken();
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
