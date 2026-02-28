import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime } from '@/hooks/useRealtime';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useUIStore } from '@/store/uiStore';
import { BadgeUnlockModal } from '@/components/badges/BadgeUnlockModal';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { COLORS } from '@/constants/theme';
import { View, StyleSheet } from 'react-native';
import getDatabase from '@/lib/database';

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
  const { isOnline, isSyncing } = useOfflineSync();

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

      <OfflineBanner isOnline={isOnline} isSyncing={isSyncing} />

      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Warm up the DB singleton early so it's ready before hooks need it
    getDatabase().catch(console.error);
  }, []);

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
