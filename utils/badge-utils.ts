import { Badge } from '../db/badge.repository';
import { Habit } from '../db/habit.repository';
import { Completion } from '../db/completion.repository';
import { StepRecord } from '../db/step.repository';
import { calculateStreak } from './streak';

export const BADGE_RULES: Badge[] = [
    { id: 'streak_7', name: 'Week Warrior', type: 'streak', requirement: 7, earned_at: null },
    { id: 'streak_21', name: 'Habit Hero', type: 'streak', requirement: 21, earned_at: null },
    { id: 'completions_100', name: 'Centurion', type: 'total_completions', requirement: 100, earned_at: null },
    { id: 'steps_10k', name: '10K Master', type: 'steps_per_day', requirement: 10000, earned_at: null },
    { id: 'step_streak_7', name: 'Unstoppable', type: 'step_streak', requirement: 7, earned_at: null },
];

export const checkNewBadges = (
    earnedBadgeIds: string[],
    habits: Habit[],
    completions: Completion[],
    stepsHistory: StepRecord[]
): Badge[] => {
    const newBadges: Badge[] = [];

    // Check streaks
    let maxStreak = 0;
    for (const habit of habits) {
        const habitCompletions = completions.filter(c => c.habit_id === habit.id);
        maxStreak = Math.max(maxStreak, calculateStreak(habitCompletions));
    }

    if (maxStreak >= 7 && !earnedBadgeIds.includes('streak_7')) {
        newBadges.push(BADGE_RULES.find(b => b.id === 'streak_7')!);
    }
    if (maxStreak >= 21 && !earnedBadgeIds.includes('streak_21')) {
        newBadges.push(BADGE_RULES.find(b => b.id === 'streak_21')!);
    }

    // Check total completions
    if (completions.length >= 100 && !earnedBadgeIds.includes('completions_100')) {
        newBadges.push(BADGE_RULES.find(b => b.id === 'completions_100')!);
    }

    // Check 10K steps day
    const has10kDay = stepsHistory.some(s => s.steps >= 10000);
    if (has10kDay && !earnedBadgeIds.includes('steps_10k')) {
        newBadges.push(BADGE_RULES.find(b => b.id === 'steps_10k')!);
    }

    return newBadges;
};
