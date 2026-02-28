import * as Notifications from 'expo-notifications';

export const NotificationService = {
    requestPermissions: async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    },

    scheduleDailyReminder: async (time: string) => {
        // time format HH:mm
        const [hours, minutes] = time.split(':').map(Number);

        await Notifications.cancelAllScheduledNotificationsAsync();

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Time to check your habits! ⚡️",
                body: "Don't break your streak. Log your progress now.",
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                hour: hours,
                minute: minutes,
                repeats: true,
            },
        });
    },

    cancelAll: async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
};
