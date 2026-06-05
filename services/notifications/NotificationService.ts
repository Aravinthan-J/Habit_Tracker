import { Platform } from 'react-native';

let Notifications: typeof import('expo-notifications') | null = null;
try {
    Notifications = require('expo-notifications');
    Notifications!.setNotificationHandler({
        handleNotification: async () => ({
            // Suppress OS foreground alert — we show our own in-app toast instead
            shouldShowAlert: false,
            shouldPlaySound: false,
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

const WATER_PREFIX = 'water-reminder-';
const WATER_MESSAGES = [
    'Time to hydrate — grab a glass of water! 💧',
    'Stay refreshed. Take a few sips of water. 💧',
    'Hydration check! Your body will thank you. 💧',
    'Keep it flowing — drink some water now. 💧',
];

/**
 * Schedule repeating daily water reminders every `intervalHours` between
 * `startHour` and `endHour` (inclusive). Each slot is its own DAILY trigger.
 */
export async function scheduleWaterReminders(
    intervalHours: number,
    startHour: number,
    endHour: number,
): Promise<void> {
    if (!Notifications) return;
    await cancelWaterReminders();
    let i = 0;
    for (let h = startHour; h <= endHour; h += intervalHours) {
        await Notifications.scheduleNotificationAsync({
            identifier: `${WATER_PREFIX}${h}`,
            content: {
                title: '💧 Water Reminder',
                body: WATER_MESSAGES[i++ % WATER_MESSAGES.length],
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: h,
                minute: 0,
            },
        }).catch(() => { });
    }
}

export async function cancelWaterReminders(): Promise<void> {
    if (!Notifications) return;
    const all = await Notifications.getAllScheduledNotificationsAsync().catch(() => []);
    for (const n of all) {
        if (n.identifier?.startsWith(WATER_PREFIX)) {
            await Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => { });
        }
    }
}

/** A once-daily "badge almost unlocked" nudge at the given hour. */
export async function scheduleBadgeNudge(hour: number, title: string, body: string): Promise<void> {
    if (!Notifications) return;
    await cancelBadgeNudge();
    await Notifications.scheduleNotificationAsync({
        identifier: 'badge-nudge',
        content: { title, body, sound: true },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute: 0,
        },
    }).catch(() => { });
}

export async function cancelBadgeNudge(): Promise<void> {
    if (!Notifications) return;
    await Notifications.cancelScheduledNotificationAsync('badge-nudge').catch(() => { });
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
