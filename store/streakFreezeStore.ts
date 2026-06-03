import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const MAX_FREEZES = 3;
export const FREEZE_EARN_EVERY = 7; // earn 1 freeze per N-day streak

export interface StreakFreezeState {
    /** Available freezes in the global pool (0..MAX_FREEZES). */
    balance: number;
    /** Calendar dates (YYYY-MM-DD) that have been protected by a freeze. */
    freezeDates: string[];
    /** How many 7-day milestones have already been rewarded (prevents double-granting). */
    milestonesRewarded: number;
    /** Last date daily maintenance ran, so it runs at most once per day. */
    lastMaintenanceDate: string | null;

    /** Replace state from a remote (Firestore) snapshot. */
    hydrateFromRemote: (data: Partial<Pick<StreakFreezeState,
        'balance' | 'freezeDates' | 'milestonesRewarded' | 'lastMaintenanceDate'>>) => void;
    /** Commit the result of a maintenance run. */
    commitMaintenance: (next: {
        balance: number;
        freezeDates: string[];
        milestonesRewarded: number;
        date: string;
    }) => void;
    reset: () => void;
}

const initial = {
    balance: 0,
    freezeDates: [] as string[],
    milestonesRewarded: 0,
    lastMaintenanceDate: null as string | null,
};

export const useStreakFreezeStore = create<StreakFreezeState>()(
    persist(
        (set) => ({
            ...initial,
            hydrateFromRemote: (data) =>
                set((s) => ({
                    balance: data.balance ?? s.balance,
                    freezeDates: data.freezeDates ?? s.freezeDates,
                    milestonesRewarded: data.milestonesRewarded ?? s.milestonesRewarded,
                    lastMaintenanceDate: data.lastMaintenanceDate ?? s.lastMaintenanceDate,
                })),
            commitMaintenance: ({ balance, freezeDates, milestonesRewarded, date }) =>
                set({
                    balance,
                    freezeDates,
                    milestonesRewarded,
                    lastMaintenanceDate: date,
                }),
            reset: () => set(initial),
        }),
        {
            name: 'streak-freeze',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);
