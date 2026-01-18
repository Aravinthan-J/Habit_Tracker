import { create } from 'zustand';
import { User } from '@habit-tracker/shared-types';

/**
 * Authentication state interface
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  hydrate: (user: User | null, token: string | null) => void;
}

/**
 * Authentication store using Zustand
 * Manages user authentication state
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  /**
   * Set authenticated user and token
   */
  setAuth: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    }),

  /**
   * Clear authentication state (logout)
   */
  clearAuth: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  /**
   * Update user data
   */
  setUser: (user) =>
    set({
      user,
    }),

  /**
   * Set loading state
   */
  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  /**
   * Hydrate auth state from storage
   */
  hydrate: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: !!(user && token),
      isLoading: false,
    }),
}));
