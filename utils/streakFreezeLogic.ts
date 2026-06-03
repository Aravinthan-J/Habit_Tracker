import { formatDate } from './dateHelpers';
import { calculateCurrentStreakWithFreezes } from './streakCalculator';
import { MAX_FREEZES, FREEZE_EARN_EVERY } from '@/store/streakFreezeStore';

/** How many days back auto-protection scans for missed days. */
const PROTECT_LOOKBACK_DAYS = 7;

export interface FreezeMaintenanceInput {
    today: string;
    /** Each habit's list of completion dates (YYYY-MM-DD). */
    completionDatesByHabit: string[][];
    balance: number;
    freezeDates: string[];
    milestonesRewarded: number;
}

export interface FreezeMaintenanceResult {
    balance: number;
    freezeDates: string[];
    milestonesRewarded: number;
    freezesUsed: number;
    freezesEarned: number;
    /** Whether any persisted field changed (excludes lastMaintenanceDate). */
    changed: boolean;
}

function shiftDate(date: string, deltaDays: number): string {
    const [y, m, d] = date.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + deltaDays);
    return formatDate(dt);
}

/**
 * Pure daily maintenance for the global Streak-Freeze pool:
 *  1. Auto-protect: spend a freeze on any single missed day that directly follows
 *     an active day (within the lookback window), keeping streaks alive.
 *  2. Auto-earn: grant 1 freeze for every FREEZE_EARN_EVERY-day streak reached
 *     (capped at MAX_FREEZES), tracked via milestonesRewarded to avoid duplicates.
 */
export function runFreezeMaintenance(input: FreezeMaintenanceInput): FreezeMaintenanceResult {
    const { today, completionDatesByHabit } = input;

    // Days that had at least one real completion across any habit.
    const activeDays = new Set<string>();
    for (const dates of completionDatesByHabit) {
        for (const d of dates) activeDays.add(d);
    }

    let balance = input.balance;
    const frozen = new Set(input.freezeDates);
    let freezesUsed = 0;

    // 1. Auto-protect isolated missed days (oldest -> newest, within lookback).
    for (let i = PROTECT_LOOKBACK_DAYS; i >= 1; i--) {
        if (balance <= 0) break;
        const day = shiftDate(today, -i);
        const prevDay = shiftDate(day, -1);
        const missed = !activeDays.has(day) && !frozen.has(day);
        const followedActiveDay = activeDays.has(prevDay);
        if (missed && followedActiveDay) {
            frozen.add(day);
            balance -= 1;
            freezesUsed += 1;
        }
    }

    const freezeDates = Array.from(frozen).sort();

    // 2. Auto-earn from the best current streak (freeze-aware).
    let maxStreak = 0;
    for (const dates of completionDatesByHabit) {
        const s = calculateCurrentStreakWithFreezes(dates, freezeDates);
        if (s > maxStreak) maxStreak = s;
    }
    const milestones = Math.floor(maxStreak / FREEZE_EARN_EVERY);
    let milestonesRewarded = input.milestonesRewarded;
    let freezesEarned = 0;
    if (milestones > milestonesRewarded) {
        const earned = milestones - milestonesRewarded;
        const newBalance = Math.min(MAX_FREEZES, balance + earned);
        freezesEarned = newBalance - balance;
        balance = newBalance;
        milestonesRewarded = milestones;
    }

    const changed =
        freezesUsed > 0 ||
        freezesEarned > 0 ||
        milestonesRewarded !== input.milestonesRewarded ||
        freezeDates.length !== input.freezeDates.length;

    return { balance, freezeDates, milestonesRewarded, freezesUsed, freezesEarned, changed };
}
