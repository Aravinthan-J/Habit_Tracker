/**
 * useAuth Hook
 * Authentication hook using Supabase Auth
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../services/supabase/supabaseClient';
import type { User, LoginCredentials, RegisterData } from '@habit-tracker/shared-types';

const toAppUser = (supabaseUser: any): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email!,
  name: supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
  stepGoal: 10000,
  reminderTime: '20:00',
  timezone: 'UTC',
  theme: 'light',
  isEmailVerified: !!supabaseUser.email_confirmed_at,
  isActive: true,
  createdAt: supabaseUser.created_at || new Date().toISOString(),
  updatedAt: supabaseUser.updated_at || new Date().toISOString(),
});

export function useAuth() {
  const { user, isAuthenticated, isLoading, setAuth, clearAuth } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * Login mutation
   */
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      setAuth(toAppUser(data.user), data.session!.access_token);
    },
  });

  /**
   * Register mutation
   */
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { name: data.name },
        },
      });
      if (error) throw new Error(error.message);
      return authData;
    },
    onSuccess: (data) => {
      if (data.user && data.session) {
        setAuth(toAppUser(data.user), data.session.access_token);
      }
    },
  });

  /**
   * Logout
   */
  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
      clearAuth();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
