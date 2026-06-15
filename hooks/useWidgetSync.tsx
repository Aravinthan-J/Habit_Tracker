import React, { useEffect, useMemo, useRef } from 'react';
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { useHabits } from './useHabits';
import { useCompletions } from './useCompletions';
import { usePreferencesStore } from '@/store/preferencesStore';
import { today } from '@/utils/dateHelpers';
import { inWeekCompletion } from '@/utils/frequency';
import { resolveIcon } from '@/utils/iconHelpers';
import { TodayWidget } from '@/widgets/TodayWidget';
import {
    saveWidgetSnapshot,
    readPendingToggles,
    clearPendingToggles,
    WidgetSnapshot,
} from '@/widgets/snapshot';

/**
 * Keeps the Android home-screen widget in sync with the app:
 *  - pushes a fresh snapshot whenever habits/completions/accent change
 *  - commits taps the user made on the widget (pending toggles) on launch
 * No-op on iOS. Mount once at the root.
 */
export function useWidgetSync() {
    const isAndroid = Platform.OS === 'android';
    const { habits } = useHabits();
    const { completions, toggleCompletion } = useCompletions();
    const accent = usePreferencesStore((s) => s.accentColor);
    const appliedRef = useRef(false);

    const todayStr = today();

    const datesByHabit = useMemo(() => {
        const map = new Map<string, string[]>();
        for (const c of completions) {
            if (!map.has(c.habit_id)) map.set(c.habit_id, []);
            map.get(c.habit_id)!.push(c.date);
        }
        return map;
    }, [completions]);

    const snapshot = useMemo<WidgetSnapshot>(() => {
        const widgetHabits = habits.map((h) => {
            const dates = datesByHabit.get(h.id) ?? [];
            const done = h.frequency === 'weekly'
                ? inWeekCompletion(dates) !== null
                : dates.includes(todayStr);
            return { id: h.id, title: h.title, icon: resolveIcon(h.icon), done };
        });
        return {
            date: todayStr,
            total: widgetHabits.length,
            done: widgetHabits.filter((h) => h.done).length,
            accent,
            habits: widgetHabits,
        };
    }, [habits, datesByHabit, accent, todayStr]);

    // Commit taps made on the widget (once per app session, after data loads).
    useEffect(() => {
        if (!isAndroid || appliedRef.current) return;
        if (habits.length === 0 && completions.length === 0) return;
        appliedRef.current = true;
        (async () => {
            const pending = await readPendingToggles();
            if (pending.length === 0) return;
            for (const p of pending) {
                const habit = habits.find((h) => h.id === p.habitId);
                if (!habit) continue;
                const dates = datesByHabit.get(p.habitId) ?? [];
                const doneNow = habit.frequency === 'weekly'
                    ? inWeekCompletion(dates) !== null
                    : dates.includes(p.date);
                try {
                    if (p.done && !doneNow) {
                        await toggleCompletion.mutateAsync({ habitId: p.habitId, date: p.date, isCompleted: false });
                    } else if (!p.done && doneNow) {
                        const removeDate = habit.frequency === 'weekly' ? (inWeekCompletion(dates) ?? p.date) : p.date;
                        await toggleCompletion.mutateAsync({ habitId: p.habitId, date: removeDate, isCompleted: true });
                    }
                } catch { /* keep going */ }
            }
            await clearPendingToggles();
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [habits.length, completions.length]);

    // Push snapshot to the widget whenever it changes.
    useEffect(() => {
        if (!isAndroid) return;
        saveWidgetSnapshot(snapshot);
        requestWidgetUpdate({
            widgetName: 'TodayHabits',
            renderWidget: () => <TodayWidget data={snapshot} />,
            widgetNotFound: () => { },
        }).catch(() => { });
    }, [isAndroid, snapshot]);
}
