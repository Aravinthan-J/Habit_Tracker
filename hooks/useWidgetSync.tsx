import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, AppState } from 'react-native';
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
    const runningRef = useRef(false);

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

    // Commit taps made on the widget. Kept in a ref so the AppState listener
    // always runs against the latest habits/completions.
    const applyRef = useRef<() => Promise<void>>(async () => { });
    applyRef.current = async () => {
        if (!isAndroid || runningRef.current) return;
        runningRef.current = true;
        try {
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
        } finally {
            runningRef.current = false;
        }
    };

    // Commit on mount and whenever the app returns to the foreground.
    useEffect(() => {
        if (!isAndroid) return;
        applyRef.current();
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') applyRef.current();
        });
        return () => sub.remove();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAndroid]);

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
