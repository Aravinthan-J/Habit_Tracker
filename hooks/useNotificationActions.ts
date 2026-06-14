import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useHabits } from './useHabits';
import { useCompletions } from './useCompletions';
import { today } from '@/utils/dateHelpers';
import {
    registerNotificationCategories,
    snoozeHabitReminder,
    ACTION_COMPLETE,
    ACTION_SNOOZE,
} from '@/services/notifications/NotificationService';
import { Habit } from '@/types/habit.types';

let Notifications: typeof import('expo-notifications') | null = null;
try { Notifications = require('expo-notifications'); } catch { }

/**
 * Handles taps on notifications and their quick-action buttons:
 *  - "✓ Done"      → marks the habit complete for today (Quick-add)
 *  - "⏰ Snooze 1h" → re-fires the reminder in an hour
 *  - body tap      → deep-links to the screen in `data.url`
 * Also processes the action that cold-started the app. Mount once at the root.
 */
export function useNotificationActions(enabled: boolean) {
    const router = useRouter();
    const { habits } = useHabits();
    const { completions, toggleCompletion } = useCompletions();

    // Keep the latest data/handlers in a ref so the listener never goes stale.
    const ref = useRef({ habits, completions, toggleCompletion, router });
    ref.current = { habits, completions, toggleCompletion, router };

    // Register the action category once.
    useEffect(() => {
        registerNotificationCategories();
    }, []);

    useEffect(() => {
        if (!Notifications || !enabled) return;

        const handle = (response: import('expo-notifications').NotificationResponse) => {
            const { habits, completions, toggleCompletion, router } = ref.current;
            const data = response.notification.request.content.data ?? {};
            const action = response.actionIdentifier;
            const habitId = typeof data.habitId === 'string' ? data.habitId : undefined;
            const date = typeof data.date === 'string' ? data.date : today();

            if (action === ACTION_COMPLETE && habitId) {
                const already = completions.some(
                    (c) => c.habit_id === habitId && c.date === date,
                );
                if (!already) {
                    toggleCompletion.mutate({ habitId, date, isCompleted: false });
                }
                return;
            }

            if (action === ACTION_SNOOZE && habitId) {
                const habit = habits.find((h: Habit) => h.id === habitId);
                const body = habit
                    ? `Still time for "${habit.title}" — you've got this!`
                    : 'Don\'t forget your habit!';
                snoozeHabitReminder(habitId, date, body);
                return;
            }

            // Default tap (or any other action): deep-link if a url was provided.
            const url = data.url;
            if (typeof url === 'string') router.push(url as any);
        };

        // Process the response that launched the app from a killed state.
        Notifications.getLastNotificationResponseAsync()
            .then((r) => { if (r) handle(r); })
            .catch(() => { });

        const sub = Notifications.addNotificationResponseReceivedListener(handle);
        return () => sub.remove();
    }, [enabled]);
}
