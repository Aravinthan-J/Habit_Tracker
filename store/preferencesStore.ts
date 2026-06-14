import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface PreferencesState {
    themeMode: ThemeMode;
    setThemeMode: (value: ThemeMode) => void;
    stepTrackingEnabled: boolean;
    setStepTrackingEnabled: (value: boolean) => void;
    notificationsEnabled: boolean;
    setNotificationsEnabled: (value: boolean) => void;
    reminderTime: string;
    setReminderTime: (value: string) => void;
    waterReminderEnabled: boolean;
    setWaterReminderEnabled: (value: boolean) => void;
    waterIntervalHours: number;
    setWaterIntervalHours: (value: number) => void;
    waterGoalGlasses: number;
    setWaterGoalGlasses: (value: number) => void;
    smartRemindersEnabled: boolean;
    setSmartRemindersEnabled: (value: boolean) => void;
    weeklyReviewEnabled: boolean;
    setWeeklyReviewEnabled: (value: boolean) => void;
    petTone: 'gentle' | 'savage';
    setPetTone: (value: 'gentle' | 'savage') => void;
}

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set) => ({
            themeMode: 'dark',
            setThemeMode: (value) => set({ themeMode: value }),
            stepTrackingEnabled: true,
            setStepTrackingEnabled: (value) => set({ stepTrackingEnabled: value }),
            notificationsEnabled: false,
            setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),
            reminderTime: '20:00',
            setReminderTime: (value) => set({ reminderTime: value }),
            waterReminderEnabled: false,
            setWaterReminderEnabled: (value) => set({ waterReminderEnabled: value }),
            waterIntervalHours: 2,
            setWaterIntervalHours: (value) => set({ waterIntervalHours: value }),
            waterGoalGlasses: 8,
            setWaterGoalGlasses: (value) => set({ waterGoalGlasses: value }),
            smartRemindersEnabled: true,
            setSmartRemindersEnabled: (value) => set({ smartRemindersEnabled: value }),
            weeklyReviewEnabled: true,
            setWeeklyReviewEnabled: (value) => set({ weeklyReviewEnabled: value }),
            petTone: 'gentle',
            setPetTone: (value) => set({ petTone: value }),
        }),
        {
            name: 'user-preferences',
            storage: createJSONStorage(() => AsyncStorage),
            skipHydration: true,
        },
    ),
);
