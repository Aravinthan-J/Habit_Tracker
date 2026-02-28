import { useQuery } from '@tanstack/react-query';
import { HabitRepository } from '../db/habit.repository';
import { CompletionRepository } from '../db/completion.repository';
import { StepRepository } from '../db/step.repository';
import { calculateCompletionRate, getWeeklyComparison } from '../utils/analytics-utils';

export const useAnalytics = () => {
    const analyticsQuery = useQuery({
        queryKey: ['analytics'],
        queryFn: async () => {
            const habits = await HabitRepository.getAll();
            const allCompletions = await CompletionRepository.getCompletionsForDate(''); // Simplified: get all
            const stepHistory = await StepRepository.getHistory('2000-01-01', '2100-01-01');

            const completionRate = calculateCompletionRate(allCompletions, habits, 30);
            const weeklyData = getWeeklyComparison(allCompletions);

            const totalSteps = stepHistory.reduce((sum, s) => sum + s.steps, 0);

            return {
                completionRate,
                weeklyData,
                totalHabits: habits.length,
                totalCompletions: allCompletions.length,
                totalSteps,
            };
        },
    });

    return {
        data: analyticsQuery.data,
        isLoading: analyticsQuery.isLoading,
    };
};
