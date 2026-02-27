import { Pedometer } from 'expo-sensors';
import { formatDate } from '@/utils/dateHelpers';
import { STEPS_PER_KM, CALORIES_PER_STEP, ACTIVE_MINUTES_PER_STEP } from '@/lib/constants';

export interface StepData {
    date: string;
    steps: number;
    distance: number;
    calories: number;
    activeMinutes: number;
}

export async function isPedometerAvailable(): Promise<boolean> {
    try {
        return await Pedometer.isAvailableAsync();
    } catch {
        return false;
    }
}

export async function getTodaySteps(): Promise<StepData | null> {
    const available = await isPedometerAvailable();
    if (!available) return null;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();

    try {
        const result = await Pedometer.getStepCountAsync(start, end);
        const steps = result.steps;
        return {
            date: formatDate(new Date()),
            steps,
            distance: parseFloat((steps / STEPS_PER_KM).toFixed(2)),
            calories: Math.round(steps * CALORIES_PER_STEP),
            activeMinutes: Math.round(steps * ACTIVE_MINUTES_PER_STEP),
        };
    } catch (err) {
        if (__DEV__) console.warn('[PedometerService] Error getting steps:', err);
        return null;
    }
}

export async function getStepsForDateRange(
    start: Date,
    end: Date
): Promise<number> {
    const available = await isPedometerAvailable();
    if (!available) return 0;

    try {
        const result = await Pedometer.getStepCountAsync(start, end);
        return result.steps;
    } catch {
        return 0;
    }
}

export function subscribeToPedometer(
    callback: (steps: number) => void
): { remove: () => void } {
    return Pedometer.watchStepCount((result) => {
        callback(result.steps);
    });
}
