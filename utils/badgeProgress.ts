import { BADGE_DEFINITIONS } from '@/constants/badges';
import { calculateCurrentStreak } from './streakCalculator';

export interface BadgeNudge {
    id: string;
    name: string;
    tier: string;
    icon_name: string;
    current: number;
    target: number;
    remaining: number;
    unit: string; // singular noun, e.g. 'day', 'check-in', 'habit', 'streak'
    percent: number;
    near: boolean;
}

interface ProgressInput {
    habits: { id: string }[];
    completions: { habit_id: string; date: string }[];
    earnedIds: Set<string>;
}

// How close (in remaining units) a badge must be to trigger a notification nudge.
const NEAR_THRESHOLD: Record<string, number> = {
    day: 5,
    'check-in': 15,
    habit: 3,
    streak: 1,
};

/**
 * Compute progress toward the locked, numerically-trackable badges and return
 * them sorted closest-first. Step/distance and one-off badges are skipped since
 * they aren't derivable from habit completions alone.
 */
export function computeBadgeNudges(input: ProgressInput): BadgeNudge[] {
    const { habits, completions, earnedIds } = input;
    const totalCompletions = completions.length;
    const totalHabits = habits.length;

    let maxStreak = 0;
    let activeStreaks = 0;
    for (const h of habits) {
        const dates = completions.filter((c) => c.habit_id === h.id).map((c) => c.date);
        const s = calculateCurrentStreak(dates);
        if (s > maxStreak) maxStreak = s;
        if (s >= 3) activeStreaks++;
    }

    const nudges: BadgeNudge[] = [];
    for (const def of BADGE_DEFINITIONS) {
        if (earnedIds.has(def.id)) continue;

        let current: number;
        let unit: string;
        if (def.type === 'streak') {
            current = maxStreak;
            unit = 'day';
        } else if (['completion_100', 'completion_500', 'completion_1000', 'completion_5000'].includes(def.id)) {
            current = totalCompletions;
            unit = 'check-in';
        } else if (def.id === 'special_collector' || def.id === 'special_power_user') {
            current = totalHabits;
            unit = 'habit';
        } else if (def.id === 'special_consistency') {
            current = activeStreaks;
            unit = 'streak';
        } else {
            continue; // not trackable from completions
        }

        const remaining = def.requirement - current;
        if (remaining <= 0) continue; // already qualifies

        nudges.push({
            id: def.id,
            name: def.name,
            tier: def.tier,
            icon_name: def.icon_name,
            current,
            target: def.requirement,
            remaining,
            unit,
            percent: Math.min(99, Math.round((current / def.requirement) * 100)),
            near: remaining <= (NEAR_THRESHOLD[unit] ?? 0),
        });
    }

    return nudges.sort((a, b) => a.remaining - b.remaining || b.percent - a.percent);
}

/** Pluralise a unit for display, e.g. (2, 'day') -> '2 days'. */
export function formatRemaining(n: number, unit: string): string {
    return `${n} ${unit}${n === 1 ? '' : 's'}`;
}
