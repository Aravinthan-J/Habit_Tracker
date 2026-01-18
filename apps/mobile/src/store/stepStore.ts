import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StepStoreState {
  dailyStepGoal: number;
  setDailyStepGoal: (goal: number) => void;
  lastSynced: Date | null;
  setLastSynced: (date: Date) => void;
}

export const useStepStore = create<StepStoreState>()(
  persist(
    (set) => ({
      dailyStepGoal: 10000, // Default step goal
      setDailyStepGoal: (goal) => set({ dailyStepGoal: goal }),
      lastSynced: null,
      setLastSynced: (date) => set({ lastSynced: date }),
    }),
    {
      name: 'step-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
