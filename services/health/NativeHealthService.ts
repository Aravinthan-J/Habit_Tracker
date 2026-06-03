import { Platform } from 'react-native';
import { formatDate } from '@/utils/dateHelpers';
import type { StepData } from './PedometerService';

// ─── iOS (HealthKit) ──────────────────────────────────────────────────────────

type HealthKitModule = typeof import('react-native-health').default;
let AppleHealthKit: HealthKitModule | null = null;
let healthKitInitialized = false;
let healthKitAvailable = false;

async function initHealthKit(): Promise<boolean> {
    if (healthKitInitialized) return healthKitAvailable;
    healthKitInitialized = true;
    try {
        const mod = await import('react-native-health');
        AppleHealthKit = mod.default;
        const { Permissions } = AppleHealthKit.Constants;
        await new Promise<void>((resolve, reject) =>
            AppleHealthKit!.initHealthKit(
                {
                    permissions: {
                        read: [
                            Permissions.StepCount,
                            Permissions.DistanceWalkingRunning,
                            Permissions.ActiveEnergyBurned,
                        ],
                        write: [],
                    },
                },
                (err) => (err ? reject(err) : resolve()),
            ),
        );
        healthKitAvailable = true;
    } catch {
        healthKitAvailable = false;
    }
    return healthKitAvailable;
}

function hkPromise<T>(fn: (cb: (err: string | null, result: T) => void) => void): Promise<T> {
    return new Promise((resolve, reject) =>
        fn((err, result) => (err ? reject(err) : resolve(result))),
    );
}

async function getHealthKitDay(date: string): Promise<StepData | null> {
    if (!AppleHealthKit) return null;
    const { Permissions } = AppleHealthKit.Constants;

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    try {
        const [stepResult, distResult, calorieResults] = await Promise.all([
            hkPromise<{ value: number }>((cb) =>
                AppleHealthKit!.getStepCount({ date: start.toISOString() }, cb),
            ),
            hkPromise<{ value: number }>((cb) =>
                AppleHealthKit!.getDistanceWalkingRunning(
                    { date: start.toISOString() },
                    cb,
                ),
            ),
            hkPromise<Array<{ value: number }>>((cb) =>
                AppleHealthKit!.getActiveEnergyBurned(
                    { startDate: start.toISOString(), endDate: end.toISOString() },
                    cb,
                ),
            ),
        ]);

        const steps = Math.round(stepResult.value ?? 0);
        const distanceMeters = distResult.value ?? 0;
        const calories = Math.round(
            calorieResults.reduce((sum, s) => sum + (s.value ?? 0), 0),
        );

        return {
            date,
            steps,
            distance: parseFloat((distanceMeters / 1000).toFixed(2)),
            calories,
            activeMinutes: 0,
        };
    } catch {
        return null;
    }
}

// ─── Android (Health Connect) ─────────────────────────────────────────────────

type HealthConnect = typeof import('react-native-health-connect');
let HC: HealthConnect | null = null;
let hcInitialized = false;
let hcAvailable = false;

async function initHealthConnect(): Promise<boolean> {
    if (hcInitialized) return hcAvailable;
    hcInitialized = true;
    try {
        HC = await import('react-native-health-connect');
        const { getSdkStatus, SdkAvailabilityStatus, initialize, requestPermission } = HC;
        const status = await getSdkStatus();
        if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) return false;

        const ready = await initialize();
        if (!ready) return false;

        await requestPermission([
            { accessType: 'read', recordType: 'Steps' },
            { accessType: 'read', recordType: 'Distance' },
            { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
            { accessType: 'read', recordType: 'ExerciseSession' },
        ]);
        hcAvailable = true;
    } catch {
        hcAvailable = false;
    }
    return hcAvailable;
}

async function getHealthConnectDay(date: string): Promise<StepData | null> {
    if (!HC) return null;
    const { aggregateRecord } = HC;

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const timeRangeFilter = {
        operator: 'between' as const,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
    };

    try {
        // aggregateRecord de-duplicates overlapping records across data origins
        // (device + Google Fit + Samsung Health, etc). Summing raw readRecords()
        // double-counts when multiple apps write steps.
        const [stepsAgg, distAgg, calAgg] = await Promise.all([
            aggregateRecord({ recordType: 'Steps', timeRangeFilter }),
            aggregateRecord({ recordType: 'Distance', timeRangeFilter }),
            aggregateRecord({ recordType: 'ActiveCaloriesBurned', timeRangeFilter }),
        ]);

        const steps = Math.round((stepsAgg as any).COUNT_TOTAL ?? 0);
        const distanceKm = (distAgg as any).DISTANCE?.inKilometers ?? 0;
        const calories = Math.round((calAgg as any).ACTIVE_CALORIES_TOTAL?.inKilocalories ?? 0);

        // Active minutes = total logged exercise-session duration for the day.
        // Resilient: if the Exercise permission/data is missing, fall back to 0
        // without failing the steps/distance/calorie read above.
        let activeMinutes = 0;
        try {
            const exAgg = await aggregateRecord({ recordType: 'ExerciseSession', timeRangeFilter });
            const seconds = (exAgg as any).EXERCISE_DURATION_TOTAL?.inSeconds ?? 0;
            activeMinutes = Math.round(seconds / 60);
        } catch {
            activeMinutes = 0;
        }

        return {
            date,
            steps,
            distance: parseFloat(distanceKm.toFixed(2)),
            calories,
            activeMinutes,
        };
    } catch {
        return null;
    }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function initNativeHealth(): Promise<boolean> {
    if (Platform.OS === 'ios') return initHealthKit();
    if (Platform.OS === 'android') return initHealthConnect();
    return false;
}

export async function isNativeHealthAvailable(): Promise<boolean> {
    if (Platform.OS === 'ios') return initHealthKit();
    if (Platform.OS === 'android') return initHealthConnect();
    return false;
}

export async function getNativeStepData(date: string): Promise<StepData | null> {
    if (Platform.OS === 'ios') {
        const ok = await initHealthKit();
        return ok ? getHealthKitDay(date) : null;
    }
    if (Platform.OS === 'android') {
        const ok = await initHealthConnect();
        return ok ? getHealthConnectDay(date) : null;
    }
    return null;
}

export async function getNativeStepsForRange(start: Date, end: Date): Promise<number> {
    if (Platform.OS !== 'ios') return 0;
    const ok = await initHealthKit();
    if (!ok || !AppleHealthKit) return 0;

    try {
        const results = await hkPromise<Array<{ value: number }>>((cb) =>
            AppleHealthKit!.getDailyStepCountSamples(
                { startDate: start.toISOString(), endDate: end.toISOString() },
                cb,
            ),
        );
        return results.reduce((sum, r) => sum + (r.value ?? 0), 0);
    } catch {
        return 0;
    }
}
