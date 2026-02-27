import { useCallback } from 'react';
import * as NotificationService from '@/services/notifications/NotificationService';
import { requestPermissions } from '@/services/notifications/NotificationService';

export function useNotifications() {
    const requestAndScheduleDaily = useCallback(async (timeStr: string) => {
        const granted = await requestPermissions();
        if (!granted) return false;

        const [h, m] = timeStr.split(':').map(Number);
        await NotificationService.scheduleDailyReminder(h, m);
        return true;
    }, []);

    const scheduleHabitReminder = useCallback(
        async (habitId: string, habitTitle: string, timeStr: string) => {
            const [h, m] = timeStr.split(':').map(Number);
            await NotificationService.scheduleHabitReminder(habitId, habitTitle, h, m);
        },
        []
    );

    const cancelHabitReminder = useCallback(async (habitId: string) => {
        await NotificationService.cancelHabitReminder(habitId);
    }, []);

    const cancelAll = useCallback(async () => {
        await NotificationService.cancelDailyReminder();
    }, []);

    return {
        requestAndScheduleDaily,
        scheduleHabitReminder,
        cancelHabitReminder,
        cancelAll,
        requestPermissions,
    };
}
