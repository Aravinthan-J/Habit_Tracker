import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { CompletionRepository } from '../db/completion.repository';
import { getTodayStr } from '../utils/date';
import { useHaptics } from './useHaptics';

export const useCompletions = (habitId?: string) => {
    const queryClient = useQueryClient();
    const { triggerHaptic } = useHaptics();

    const toggleCompletion = useMutation({
        mutationFn: ({ id, date }: { id: string; date: string }) =>
            Promise.resolve(CompletionRepository.toggle(id, date)),
        onSuccess: (isNowCompleted) => {
            if (isNowCompleted) {
                triggerHaptic('success');
            } else {
                triggerHaptic('impactLight');
            }
            queryClient.invalidateQueries({ queryKey: ['completions'] });
            queryClient.invalidateQueries({ queryKey: ['habits'] }); // For streak calculation if needed
        },
    });

    const habitCompletions = useQuery({
        queryKey: ['completions', habitId],
        queryFn: () => habitId ? CompletionRepository.getByHabitId(habitId) : [],
        enabled: !!habitId,
    });

    const todayCompletions = useQuery({
        queryKey: ['completions', 'today', getTodayStr()],
        queryFn: () => CompletionRepository.getCompletionsForDate(getTodayStr()),
    });

    return {
        toggleCompletion,
        habitCompletions: habitCompletions.data ?? [],
        todayCompletions: todayCompletions.data ?? [],
        isTodayCompleted: (checkId: string) =>
            todayCompletions.data?.some(c => c.habit_id === checkId) ?? false,
    };
};
