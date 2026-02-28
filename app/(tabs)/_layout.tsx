import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#6366f1',
                tabBarInactiveTintColor: isDark ? '#94a3b8' : '#64748b',
                tabBarStyle: {
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderTopWidth: 0,
                    elevation: 0,
                    height: 60,
                    paddingBottom: 10,
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Today',
                    tabBarIcon: ({ color }) => <Ionicons name="today" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    title: 'Calendar',
                    tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Analytics',
                    tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
