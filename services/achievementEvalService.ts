import { Achievement, AchievementInsert } from '@/types/advanced.types';
import { HabitWithCompletions } from '@/types/habit.types';

export const EVALUATORS = {
    FIRST_HABIT: {
        id: 'first_habit',
        title: 'The Beginning',
        description: 'Completed your first ever habit! 🚀',
        icon: 'rocket',
    },
    STREAK_7: {
        id: 'streak_7',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak on any habit.',
        icon: 'flame',
    },
    STREAK_30: {
        id: 'streak_30',
        title: 'Monthly Master',
        description: 'Maintain a 30-day streak on any habit.',
        icon: 'trophy',
    },
    DEEP_WORK_5: {
        id: 'deep_work_5',
        title: 'Deep Diver',
        description: 'Completed 5 deep work templates.',
        icon: 'water',
    },
};

export function evaluateAchievements(
    habits: HabitWithCompletions[],
    existingAchievements: Achievement[]
): AchievementInsert[] {
    const earnedAchievementIds = new Set(existingAchievements.map(a => a.id));
    const newAchievements: AchievementInsert[] = [];

    // First Habit
    const totalCompletions = habits.reduce((acc, h) => acc + (h.totalCompletions || 0), 0);
    if (totalCompletions >= 1 && !earnedAchievementIds.has(EVALUATORS.FIRST_HABIT.id)) {
        newAchievements.push({
            user_id: habits[0]?.user_id || '',
            title: EVALUATORS.FIRST_HABIT.title,
            description: EVALUATORS.FIRST_HABIT.description,
            icon: EVALUATORS.FIRST_HABIT.icon,
        });
    }

    // 7-Day Streak
    const has7DayStreak = habits.some(h => (h.currentStreak || 0) >= 7);
    if (has7DayStreak && !earnedAchievementIds.has(EVALUATORS.STREAK_7.id)) {
        newAchievements.push({
            user_id: habits[0]?.user_id || '',
            title: EVALUATORS.STREAK_7.title,
            description: EVALUATORS.STREAK_7.description,
            icon: EVALUATORS.STREAK_7.icon,
        });
    }

    return newAchievements;
}
