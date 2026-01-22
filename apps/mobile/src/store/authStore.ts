/**
 * Auth Store
 * Zustand store for authentication state
 */

import { create } from 'zustand';
import type { User } from '@habit-tracker/shared-types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
}

interface AuthActions {
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  hydrate: (user: User | null, token: string | null) => void;
  updateUser: (user: User) => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isHydrated: false,

  // Actions
  setAuth: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    }),

  clearAuth: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  hydrate: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: !!user && !!token,
      isLoading: false,
      isHydrated: true,
    }),

  updateUser: (user) =>
    set({
      user,
    }),
}));
