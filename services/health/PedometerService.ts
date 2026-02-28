import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDate } from '@/utils/dateHelpers';
import { STEPS_PER_KM, CALORIES_PER_STEP, ACTIVE_MINUTES_PER_STEP } from '@/lib/constants';

// Pedometer.getStepCountAsync (date-range query) is iOS-only.
// On Android we accumulate watchStepCount deltas and persist them to AsyncStorage.
const STEP_RANGE_SUPPORTED = Platform.OS === 'ios';

const androidStepsKey = (date: string) => `android_steps_${date}`;

function stepsToData(steps: number, date: string): StepData {
    return {
        date,
        steps,
        distance: parseFloat((steps / STEPS_PER_KM).toFixed(2)),
        calories: Math.round(steps * CALORIES_PER_STEP),
        activeMinutes: Math.round(steps * ACTIVE_MINUTES_PER_STEP),
    };
}

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
    const date = formatDate(new Date());

    if (!STEP_RANGE_SUPPORTED) {
        // Android: read accumulated steps that subscribeToPedometer writes
        try {
            const stored = await AsyncStorage.getItem(androidStepsKey(date));
            const steps = stored ? parseInt(stored, 10) : 0;
            return stepsToData(steps, date);
        } catch {
            return null;
        }
    }

    // iOS: accurate date-range query via CoreMotion
    const available = await isPedometerAvailable();
    if (!available) return null;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();

    try {
        const result = await Pedometer.getStepCountAsync(start, end);
        return stepsToData(result.steps, date);
    } catch (err) {
        if (__DEV__) console.warn('[PedometerService] getTodaySteps error:', err);
        return null;
    }
}

export async function getStepsForDateRange(start: Date, end: Date): Promise<number> {
    if (!STEP_RANGE_SUPPORTED) return 0;

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
    callback: (steps: number) => void,
): { remove: () => void } {
    if (Platform.OS === 'android') {
        const date = formatDate(new Date());
        const key = androidStepsKey(date);

        // Steps accumulated during this session (added on top of the persisted baseline)
        let sessionSteps = 0;
        let baseline = 0;
        let ready = false;

        // Load today's persisted baseline before counting starts
        AsyncStorage.getItem(key).then((stored) => {
            baseline = stored ? parseInt(stored, 10) : 0;
            ready = true;
            callback(baseline + sessionSteps);
        });

        const sub = Pedometer.watchStepCount((result) => {
            // result.steps is the per-event delta on Android
            sessionSteps += result.steps;
            const total = baseline + sessionSteps;
            callback(total);

            if (ready) {
                // Persist so getTodaySteps() always returns up-to-date data
                AsyncStorage.setItem(key, String(total)).catch(() => {});
            }
        });

        return sub;
    }

    // iOS: watchStepCount already returns cumulative steps since subscription start
    return Pedometer.watchStepCount((result) => {
        callback(result.steps);
    });
}
