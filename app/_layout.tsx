import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime } from '@/hooks/useRealtime';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useUIStore } from '@/store/uiStore';
import { BadgeUnlockModal } from '@/components/badges/BadgeUnlockModal';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { InAppNotification, NotifPayload } from '@/components/ui/InAppNotification';
import { COLORS } from '@/constants/theme';
import { View, StyleSheet } from 'react-native';
import getDatabase from '@/lib/database';
import { ErrorBoundary } from '@/components/ErrorBoundary';

let Notifications: typeof import('expo-notifications') | null = null;
try { Notifications = require('expo-notifications'); } catch { }

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
  const [activeNotif, setActiveNotif] = useState<NotifPayload | null>(null);

  // Listen for foreground notifications and show custom toast
  useEffect(() => {
    if (!Notifications || !user) return;
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      setActiveNotif({
        title: notification.request.content.title ?? 'Habity',
        body:  notification.request.content.body  ?? '',
      });
    });
    return () => sub.remove();
  }, [user]);

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
        <Stack.Screen name="privacy" options={{ presentation: 'modal' }} />
        <Stack.Screen name="support" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      <BadgeUnlockModal
        badge={unlockedBadge}
        visible={celebrationVisible}
        onClose={hideCelebration}
      />

      {!!user && <OfflineBanner isOnline={isOnline} isSyncing={isSyncing} />}

      <InAppNotification
        notif={activeNotif}
        onDismiss={() => setActiveNotif(null)}
      />

      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Warm up the DB singleton early so it's ready before hooks need it
    getDatabase().catch((e) => { if (__DEV__) console.error('[DB init]', e); });
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <View style={styles.root}>
          <AppContent />
        </View>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
});
