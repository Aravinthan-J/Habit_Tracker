import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeDatabase } from '../db/sqlite';
import { View, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';
import { BadgeModal } from '../components/badges/BadgeModal';
import '../global.css'; // NativeWind/Tailwind support

const queryClient = new QueryClient();

// Configure notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export default function RootLayout() {
    const [dbReady, setDbReady] = useState(false);

    useEffect(() => {
        async function setup() {
            try {
                await initializeDatabase();
                setDbReady(true);
            } catch (error) {
                console.error('Failed to initialize database', error);
            }
        }
        setup();
    }, []);

    if (!dbReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
            </Stack>
            <BadgeModal />
        </QueryClientProvider>
    );
}
