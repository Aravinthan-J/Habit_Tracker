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
        // Load auth state first
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

        // Initialize services after auth is ready
        try {
          console.log('Initializing database...');
          await databaseService.initialize();

          console.log('Initializing network monitor...');
          networkMonitor.initialize();

          // Setup auto-sync on reconnection
          networkMonitor.onReconnection(async () => {
            console.log('Network reconnected, triggering sync...');
            if (user?.id) {
              syncService.performFullSync(user.id).catch(console.error);
            }
          });

          if (user?.id) {
            // Perform initial sync if online (WAIT for it to complete)
            if (networkMonitor.isConnected()) {
              try {
                console.log('Performing initial sync...');
                const syncResult = await syncService.performFullSync(user.id);
                console.log('Initial sync completed:', syncResult);
              } catch (syncError) {
                console.error('Initial sync failed:', syncError);
                // Continue anyway, user can manually refresh
              }
            } else {
              console.log('Offline mode - skipping initial sync');
            }

            // Background tasks disabled - use manual sync instead
            console.log('Background sync disabled. Use manual refresh in UI.');
            // await BackgroundSyncTask.register();
            // await StepSyncTask.register();
          }
        } catch (syncError) {
          console.error('Error initializing sync services:', syncError);
          // Don't crash the app, sync is optional
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        hydrate(null, null);
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      try {
        networkMonitor.cleanup();
      } catch (e) {
        // Ignore cleanup errors
      }
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
