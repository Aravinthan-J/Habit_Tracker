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
import { supabase } from './services/supabase/supabaseClient';
import type { User } from '@habit-tracker/shared-types';

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
import { useNotificationListeners } from './hooks/useNotifications';
import { databaseService } from './services/database/DatabaseService';
import { networkMonitor } from './services/sync/NetworkMonitor';
import { syncService } from './services/sync/SyncService';
// Background tasks temporarily disabled due to Gradle compatibility
// import { BackgroundSyncTask } from './services/background/BackgroundSyncTask';
// import { StepSyncTask } from './services/background/StepSyncTask';

/**
 * React Query Configuration
 * Updated for offline-first architecture
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0, // Don't retry local DB reads
      staleTime: Infinity, // Local data never stale
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnReconnect: true, // Sync on reconnect
    },
    mutations: {
      retry: 0, // Don't retry local writes
    },
  },
});

export default function App() {
  const { hydrate } = useAuthStore();

  /**
   * Initialize app services and hydrate auth state
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize local database and network monitor first
        await databaseService.initialize();
        networkMonitor.initialize();

        // Load Supabase session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          hydrate(toAppUser(session.user), session.access_token);

          // Setup auto-sync on reconnection
          networkMonitor.onReconnection(async () => {
            console.log('Network reconnected, triggering sync...');
            syncService.performFullSync(session.user.id).catch(console.error);
          });
        } else {
          hydrate(null, null);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        hydrate(null, null);
      }
    };

    initializeApp();

    // Listen for auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        hydrate(toAppUser(session.user), session.access_token);
      } else {
        hydrate(null, null);
      }
    });

    return () => {
      subscription.unsubscribe();
      networkMonitor.cleanup();
    };
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
