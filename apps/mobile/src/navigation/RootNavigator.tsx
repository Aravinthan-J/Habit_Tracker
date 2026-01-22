/**
 * Root Navigator
 * Switches between Auth and App based on authentication state
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { HomeScreen } from '../screens/home/HomeScreen';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner } from '../components/common';

export function RootNavigator() {
  const { isAuthenticated, isLoading, isHydrated } = useAuthStore();

  // Show loading while hydrating auth state
  if (!isHydrated || isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <HomeScreen /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
