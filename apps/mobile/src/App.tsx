/**
 * Main App Component
 * Sets up providers and navigation
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './navigation/RootNavigator';
import { useAuthStore } from './store/authStore';
import { SecureStorageService } from './services/storage/SecureStorageService';
import { api } from './services/api/apiClient';
import { useNotificationListeners } from './hooks/useNotifications';

/**
 * React Query Configuration
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function App() {
  const { hydrate } = useAuthStore();

  /**
   * Hydrate auth state on app start
   */
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const [user, token] = await Promise.all([
          SecureStorageService.getUser(),
          SecureStorageService.getToken(),
        ]);

        if (user && token) {
          // Set token in API client
          api.setToken(token);
        }

        // Hydrate auth store
        hydrate(user, token);
      } catch (error) {
        console.error('Error loading auth state:', error);
        hydrate(null, null);
      }
    };

    loadAuthState();
  }, [hydrate]);

  /**
   * Setup notification listeners
   */
  useNotificationListeners(
    (notification) => {
      // Handle notification received in foreground
      console.log('📬 Notification received:', notification.request.content);
    },
    (response) => {
      // Handle notification tapped by user
      const data = response.notification.request.content.data;
      console.log('👆 Notification tapped:', data);

      // Navigate based on notification type
      if (data?.type === 'habit_reminder' && data?.habitId) {
        // TODO: Navigate to habit detail or home screen
        console.log('Navigate to habit:', data.habitId);
      } else if (data?.type === 'badge_unlock') {
        // TODO: Navigate to badges screen
        console.log('Navigate to badges screen');
      }
    }
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <RootNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
