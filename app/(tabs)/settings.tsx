import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUIStore } from '../../store/ui-store';
import { Ionicons } from '@expo/vector-icons';
import { NotificationService } from '../../services/notification-service';

export default function SettingsScreen() {
    const { theme, setTheme } = useUIStore();
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    const toggleNotifications = async (value: boolean) => {
        if (value) {
            const granted = await NotificationService.requestPermissions();
            if (granted) {
                await NotificationService.scheduleDailyReminder('20:00');
                setNotificationsEnabled(true);
            } else {
                Alert.alert('Permission Denied', 'Please enable notifications in your device settings.');
            }
        } else {
            await NotificationService.cancelAll();
            setNotificationsEnabled(false);
        }
    };

    const handleBackup = () => {
        Alert.alert('Backup', 'Data export feature requires additional native modules. Please ensure expo-file-system and expo-sharing are installed.');
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            <ScrollView className="flex-1 px-4 pt-4">
                <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Settings</Text>

                <View className="bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden mb-6">
                    <View className="p-4 border-b border-slate-100 dark:border-slate-700 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Ionicons name="moon" size={22} color="#6366f1" />
                            <Text className="ml-3 text-lg font-medium text-slate-900 dark:text-white">Dark Mode</Text>
                        </View>
                        <Switch
                            value={theme === 'dark'}
                            onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
                        />
                    </View>

                    <View className="p-4 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Ionicons name="notifications" size={22} color="#6366f1" />
                            <Text className="ml-3 text-lg font-medium text-slate-900 dark:text-white">Reminders</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={toggleNotifications}
                        />
                    </View>
                </View>

                <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Data Management</Text>

                <TouchableOpacity
                    onPress={handleBackup}
                    className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex-row items-center mb-4"
                >
                    <Ionicons name="cloud-upload" size={22} color="#6366f1" />
                    <Text className="ml-3 text-lg font-medium text-slate-900 dark:text-white">Export Backup (JSON)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex-row items-center"
                >
                    <Ionicons name="cloud-download" size={22} color="#6366f1" />
                    <Text className="ml-3 text-lg font-medium text-slate-900 dark:text-white">Restore from Backup</Text>
                </TouchableOpacity>

                <View className="mt-12 items-center">
                    <Text className="text-slate-400 text-sm">Habity v1.0.0</Text>
                    <Text className="text-slate-400 text-xs mt-1">100% Offline & Private</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
