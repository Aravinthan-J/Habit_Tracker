import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PreferencesState {
    stepTrackingEnabled: boolean;
    setStepTrackingEnabled: (value: boolean) => void;
    notificationsEnabled: boolean;
    setNotificationsEnabled: (value: boolean) => void;
    reminderTime: string;
    setReminderTime: (value: string) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set) => ({
            stepTrackingEnabled: true,
            setStepTrackingEnabled: (value) => set({ stepTrackingEnabled: value }),
            notificationsEnabled: false,
            setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),
            reminderTime: '20:00',
            setReminderTime: (value) => set({ reminderTime: value }),
        }),
        {
            name: 'user-preferences',
            storage: createJSONStorage(() => AsyncStorage),
            skipHydration: true,
        },
    ),
);
