import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './navigation/RootNavigator';
import { useAuthStore } from './store/authStore';
import { SecureStorageService } from './services/storage/SecureStorageService';

// Ignore specific warnings in development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

/**
 * React Query client configuration
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

/**
 * Main App Component
 */
const App = (): React.JSX.Element => {
  const { hydrate } = useAuthStore();

  /**
   * Load persisted auth state on mount
   */
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const [user, token] = await Promise.all([
          SecureStorageService.getUser(),
          SecureStorageService.getToken(),
        ]);

        hydrate(user, token);
      } catch (error) {
        console.error('Error loading auth state:', error);
        hydrate(null, null);
      }
    };

    loadAuthState();
  }, [hydrate]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <RootNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
