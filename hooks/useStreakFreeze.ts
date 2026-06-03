import { useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { useStreakFreezeStore, MAX_FREEZES } from '@/store/streakFreezeStore';
import { useHabits } from './useHabits';
import { useCompletions } from './useCompletions';
import { getHabitCompletionDates } from '@/utils/streakCalculator';
import { runFreezeMaintenance } from '@/utils/streakFreezeLogic';
import { today } from '@/utils/dateHelpers';

/**
 * Drives the global Streak-Freeze pool: loads remote state, runs once-per-day
 * maintenance (auto-earn + auto-protect), and syncs results to Firestore.
 * Mount once near the top of the app (e.g. the home screen).
 */
export function useStreakFreeze() {
    const { user } = useAuthStore();
    const store = useStreakFreezeStore();
    const { habits, isLoading: habitsLoading } = useHabits();
    const { completions, isLoading: completionsLoading } = useCompletions();

    // Load freeze state from Firestore on login / app start.
    useEffect(() => {
        if (!user) return;
        getDoc(doc(db, 'users', user.uid)).then((snap) => {
            if (!snap.exists()) return;
            const data = snap.data();
            store.hydrateFromRemote({
                balance: data.freeze_balance,
                freezeDates: data.freeze_dates,
                milestonesRewarded: data.freeze_milestones,
                lastMaintenanceDate: data.freeze_last_maintenance,
            });
        }).catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid]);

    // Run daily maintenance once per calendar day, after data has loaded.
    useEffect(() => {
        if (!user || habitsLoading || completionsLoading) return;
        const date = today();
        if (store.lastMaintenanceDate === date) return;

        const completionDatesByHabit = habits.map((h) =>
            getHabitCompletionDates(completions, h.id),
        );
        const result = runFreezeMaintenance({
            today: date,
            completionDatesByHabit,
            balance: store.balance,
            freezeDates: store.freezeDates,
            milestonesRewarded: store.milestonesRewarded,
        });

        store.commitMaintenance({
            balance: result.balance,
            freezeDates: result.freezeDates,
            milestonesRewarded: result.milestonesRewarded,
            date,
        });

        if (result.changed) {
            setDoc(
                doc(db, 'users', user.uid),
                {
                    freeze_balance: result.balance,
                    freeze_dates: result.freezeDates,
                    freeze_milestones: result.milestonesRewarded,
                    freeze_last_maintenance: date,
                },
                { merge: true },
            ).catch(() => {});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid, habitsLoading, completionsLoading, habits, completions, store.lastMaintenanceDate]);

    return {
        balance: store.balance,
        maxFreezes: MAX_FREEZES,
        freezeDates: store.freezeDates,
    };
}
