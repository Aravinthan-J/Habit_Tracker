import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { completionApi } from '../utils/apiClient';
import { CreateCompletionData, CompletionFilters } from '@habit-tracker/shared-types';
import { format } from 'date-fns';

/**
 * Completions hook for managing habit completions
 */
export const useCompletions = (filters?: CompletionFilters) => {
  const queryClient = useQueryClient();

  /**
   * Get completions with optional filters
   */
  const {
    data: completions = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['completions', filters],
    queryFn: () => completionApi.getAll(filters),
  });

  /**
   * Get today's completions
   */
  const { data: todayCompletions = [] } = useQuery({
    queryKey: ['completions', 'today'],
    queryFn: () =>
      completionApi.getAll({
        date: format(new Date(), 'yyyy-MM-dd'),
      }),
  });

  /**
   * Mark habit complete mutation
   */
  const markCompleteMutation = useMutation({
    mutationFn: (data: CreateCompletionData) => completionApi.create(data),
    onMutate: async (data) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['completions'] });

      const previousCompletions = queryClient.getQueryData(['completions', 'today']);

      // Optimistically add the completion
      queryClient.setQueryData(['completions', 'today'], (old: any = []) => [
        ...old,
        {
          id: 'temp-' + Date.now(),
          habitId: data.habitId,
          date: data.date,
          completedAt: new Date().toISOString(),
        },
      ]);

      return { previousCompletions };
    },
    onSuccess: () => {
      // Invalidate all completion queries
      queryClient.invalidateQueries({ queryKey: ['completions'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habitStats'] });
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCompletions) {
        queryClient.setQueryData(['completions', 'today'], context.previousCompletions);
      }
    },
  });

  /**
   * Unmark habit completion mutation
   */
  const unmarkCompleteMutation = useMutation({
    mutationFn: ({ habitId, date }: { habitId: string; date: string }) =>
      completionApi.deleteCompletion(habitId, date),
    onMutate: async ({ habitId }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['completions'] });

      const previousCompletions = queryClient.getQueryData(['completions', 'today']);

      // Optimistically remove the completion
      queryClient.setQueryData(['completions', 'today'], (old: any = []) =>
        old.filter((c: any) => c.habitId !== habitId)
      );

      return { previousCompletions };
    },
    onSuccess: () => {
      // Invalidate all completion queries
      queryClient.invalidateQueries({ queryKey: ['completions'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habitStats'] });
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCompletions) {
        queryClient.setQueryData(['completions', 'today'], context.previousCompletions);
      }
    },
  });

  /**
   * Toggle completion for a habit (mark complete or unmark)
   */
  const toggleCompletion = (habitId: string, date: string = format(new Date(), 'yyyy-MM-dd')) => {
    const isCompleted = todayCompletions.some((c) => c.habitId === habitId);

    if (isCompleted) {
      unmarkCompleteMutation.mutate({ habitId, date });
    } else {
      markCompleteMutation.mutate({ habitId, date });
    }
  };

  return {
    completions,
    todayCompletions,
    isLoading,
    refetch,

    // Mutations
    markComplete: markCompleteMutation.mutate,
    unmarkComplete: unmarkCompleteMutation.mutate,
    toggleCompletion,

    // Mutation states
    isMarkingComplete: markCompleteMutation.isPending,
    isUnmarkingComplete: unmarkCompleteMutation.isPending,
  };
};
