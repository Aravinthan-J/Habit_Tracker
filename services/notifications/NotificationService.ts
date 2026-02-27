import { Platform } from 'react-native';

let Notifications: typeof import('expo-notifications') | null = null;
try {
    Notifications = require('expo-notifications');
    Notifications!.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });
} catch (e) {
    // expo-notifications not available in Expo Go (SDK 53+)
}

export async function requestPermissions(): Promise<boolean> {
    if (!Notifications) return false;
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<string | null> {
    if (!Notifications) return null;
    try {
        await cancelDailyReminder();
        const id = await Notifications.scheduleNotificationAsync({
            identifier: 'daily-reminder',
            content: {
                title: '🎯 Time to check in!',
                body: "Don't break your streak — mark your habits now.",
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
            },
        });
        return id;
    } catch (err) {
        if (__DEV__) console.warn('[NotificationService] schedule failed:', err);
        return null;
    }
}

export async function cancelDailyReminder(): Promise<void> {
    if (!Notifications) return;
    await Notifications.cancelScheduledNotificationAsync('daily-reminder').catch(() => { });
}

export async function scheduleHabitReminder(
    habitId: string,
    habitTitle: string,
    hour: number,
    minute: number
): Promise<void> {
    if (!Notifications) return;
    const identifier = `habit-reminder-${habitId}`;
    await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => { });
    await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
            title: `⏰ Habit reminder`,
            body: `Time to complete "${habitTitle}"`,
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
        },
    });
}

export async function cancelHabitReminder(habitId: string): Promise<void> {
    if (!Notifications) return;
    await Notifications.cancelScheduledNotificationAsync(`habit-reminder-${habitId}`).catch(() => { });
}

export async function sendImmediateNotification(title: string, body: string): Promise<void> {
    if (!Notifications) return;
    await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: null,
    });
}

export async function getAllScheduledNotifications() {
    if (!Notifications) return [];
    return await Notifications.getAllScheduledNotificationsAsync();
}
