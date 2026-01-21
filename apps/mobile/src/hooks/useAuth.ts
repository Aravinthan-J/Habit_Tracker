import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoginCredentials, RegisterData, User } from '@habit-tracker/shared-types';
import { authApi } from '../utils/apiClient';
import { useAuthStore } from '../store/authStore';
import { SecureStorageService } from '../services/storage/SecureStorageService';

/**
 * Authentication hook using React Query
 * Handles login, register, logout, and user management
 */
export const useAuth = () => {
  const queryClient = useQueryClient();
  const { setAuth, clearAuth, user, isAuthenticated, setLoading } = useAuthStore();

  /**
   * Login mutation
   */
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authApi.login(credentials);
      return response;
    },
    onSuccess: async (data) => {
      // Save token and user to secure storage
      await SecureStorageService.saveToken(data.token);
      await SecureStorageService.saveUser(data.user);

      // Update auth store
      setAuth(data.user, data.token);

      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      console.error('Login error:', error);
    },
  });

  /**
   * Register mutation
   */
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await authApi.register(data);
      return response;
    },
    onSuccess: async (data) => {
      // Save token and user to secure storage
      await SecureStorageService.saveToken(data.token);
      await SecureStorageService.saveUser(data.user);

      // Update auth store
      setAuth(data.user, data.token);

      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      console.error('Register error:', error);
    },
  });

  /**
   * Logout mutation
   */
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout API error:', error);
      }
    },
    onSuccess: async () => {
      // Clear secure storage
      await SecureStorageService.clearAll();

      // Clear auth store
      clearAuth();

      // Clear all queries
      queryClient.clear();
    },
  });

  /**
   * Get current user query
   */
  const { data: currentUser, refetch: refetchUser } = useQuery({
    queryKey: ['user', 'current'],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      return response;
    },
    enabled: isAuthenticated,
    retry: false,
  });

  /**
   * Hydrate auth state from storage on app start
   */
  const hydrateAuth = async () => {
    try {
      setLoading(true);
      const token = await SecureStorageService.getToken();
      const storedUser = await SecureStorageService.getUser();

      if (token && storedUser) {
        // Verify token is still valid by fetching current user
        try {
          const currentUser = await authApi.getCurrentUser();
          setAuth(currentUser, token);
        } catch (error) {
          // Token is invalid, clear storage
          console.error('Token validation failed:', error);
          await SecureStorageService.clearAll();
          clearAuth();
        }
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('Hydration error:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  return {
    // Mutations
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,

    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    // Mutation errors
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logoutError: logoutMutation.error,

    // Auth state
    user,
    isAuthenticated,
    currentUser,
    refetchUser,

    // Utilities
    hydrateAuth,
  };
};
