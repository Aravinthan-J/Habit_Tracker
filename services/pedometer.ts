import { Pedometer } from 'expo-sensors';
import { StepRepository, StepRecord } from '../db/step.repository';
import { getTodayStr } from '../utils/date';

export const PedometerService = {
    checkAvailability: async () => {
        return await Pedometer.isAvailableAsync();
    },

    subscribe: (callback: (result: Pedometer.PedometerResult) => void) => {
        return Pedometer.watchStepCount(callback);
    },

    getStepsForRange: async (start: Date, end: Date) => {
        return await Pedometer.getStepCountAsync(start, end);
    },

    saveDailySteps: async (steps: number, goal: number) => {
        const today = getTodayStr();
        const record: StepRecord = {
            id: today,
            date: today,
            steps,
            goal,
            distance: steps * 0.000762, // Rough estimate in km (0.762m per step)
            created_at: new Date().toISOString(),
        };
        return StepRepository.upsert(record);
    },
};
