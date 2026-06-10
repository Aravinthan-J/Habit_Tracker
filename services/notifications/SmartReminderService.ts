import { Habit } from '@/types/habit.types';
import { getCompletionTimes } from '@/services/storage/LocalStorageService';
import {
    cancelAllSmartReminders,
    scheduleSmartReminderOccurrence,
} from '@/services/notifications/NotificationService';
import { today, formatDate, formatReminderTime } from '@/utils/dateHelpers';

/** Minimum check-offs before we trust the learned pattern. */
const MIN_SAMPLES = 3;
/** How many days ahead to schedule one-shot reminders (kept small to stay
 *  well under the iOS 64 pending-notification limit with many habits). */
const DAYS_AHEAD = 3;
/** Fallback reminder time when there's no history yet: 8 PM. */
const FALLBACK_MINUTES = 20 * 60;

/** Median minutes-of-day of recent completions, or null with too few samples. */
export function typicalCompletionMinutes(samples: number[]): number | null {
    if (samples.length < MIN_SAMPLES) return null;
    const sorted = [...samples].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 1 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function minutesToTimeStr(minutes: number): string {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function parseTimeStr(time: string): number | null {
    const [h, m] = time.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
}

/**
 * Re-schedule all smart reminders from scratch: one one-shot notification per
 * habit per day for the next few days, skipping today when the habit is
 * already done (or the time has passed).
 */
export async function syncSmartReminders(
    habits: Habit[],
    completedTodayIds: Set<string>
): Promise<void> {
    await cancelAllSmartReminders();

    const smartHabits = habits.filter((h) => h.smart_reminder && h.notifications_enabled !== false);
    if (smartHabits.length === 0) return;

    const now = new Date();
    const todayStr = today();

    for (const habit of smartHabits) {
        const samples = await getCompletionTimes(habit.id).catch(() => [] as number[]);
        const learned = typicalCompletionMinutes(samples);
        const minutes = learned
            ?? (habit.reminder_time ? parseTimeStr(habit.reminder_time) : null)
            ?? FALLBACK_MINUTES;

        const timeLabel = formatReminderTime(minutesToTimeStr(minutes));
        const body = learned !== null
            ? `You usually do "${habit.title}" around ${timeLabel} — keep it going!`
            : `Time to complete "${habit.title}"`;

        for (let offset = 0; offset < DAYS_AHEAD; offset++) {
            const fireAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
            fireAt.setMinutes(minutes);
            const dateStr = formatDate(fireAt);

            if (dateStr === todayStr && (completedTodayIds.has(habit.id) || fireAt <= now)) {
                continue; // already done today, or today's slot has passed
            }
            await scheduleSmartReminderOccurrence(habit.id, dateStr, fireAt, body);
        }
    }
}
