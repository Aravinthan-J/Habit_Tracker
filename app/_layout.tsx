import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime } from '@/hooks/useRealtime';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useUIStore } from '@/store/uiStore';
import { BadgeUnlockModal } from '@/components/badges/BadgeUnlockModal';
import { COLORS } from '@/constants/theme';
import { View, StyleSheet } from 'react-native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 30,
    },
  },
});

function AppContent() {
  const { isLoading, user } = useAuth();
  useRealtime();
  useOfflineSync();

  const { celebrationVisible, unlockedBadge, hideCelebration } = useUIStore();

  if (isLoading) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="(auth)" />
        ) : (
          <Stack.Screen name="(tabs)" />
        )}
        <Stack.Screen name="habit/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="habit/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="badge/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      <BadgeUnlockModal
        badge={unlockedBadge}
        visible={celebrationVisible}
        onClose={hideCelebration}
      />
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.root}>
        <AppContent />
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
});
