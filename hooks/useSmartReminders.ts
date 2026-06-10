import { useEffect, useMemo, useRef } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { useCompletions } from '@/hooks/useCompletions';
import { syncSmartReminders } from '@/services/notifications/SmartReminderService';
import {
    requestPermissions,
    scheduleWeeklyReviewReminder,
} from '@/services/notifications/NotificationService';
import { today } from '@/utils/dateHelpers';

/**
 * Keeps smart reminders in sync with habits and today's completions.
 * Mount once (at the root) — it reschedules whenever either changes.
 */
export function useSmartReminders() {
    const { habits } = useHabits();
    const { completions } = useCompletions();
    const permissionAsked = useRef(false);

    const todayStr = today();
    const completedTodayKey = useMemo(
        () => completions.filter((c) => c.date === todayStr).map((c) => c.habit_id).sort().join(','),
        [completions, todayStr]
    );
    const smartKey = useMemo(
        () => habits
            .filter((h) => h.smart_reminder)
            .map((h) => `${h.id}:${h.notifications_enabled ? 1 : 0}`)
            .sort()
            .join(','),
        [habits]
    );

    useEffect(() => {
        if (habits.length === 0) return;

        // Debounce: completion toggles can fire in quick succession
        const timer = setTimeout(async () => {
            if (smartKey && !permissionAsked.current) {
                permissionAsked.current = true;
                const granted = await requestPermissions();
                if (!granted) return;
            }
            const completedToday = new Set(completedTodayKey ? completedTodayKey.split(',') : []);
            await syncSmartReminders(habits, completedToday).catch(() => { });
            await scheduleWeeklyReviewReminder().catch(() => { });
        }, 1500);

        return () => clearTimeout(timer);
        // habits identity changes with every fetch; key on the relevant fields instead
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [smartKey, completedTodayKey, habits.length]);
}
