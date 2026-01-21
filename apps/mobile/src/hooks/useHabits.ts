import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitApi, completionApi } from '../utils/apiClient';
import { Habit, CreateHabitData, UpdateHabitData } from '@habit-tracker/shared-types';
import { format, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Extended habit interface with completion data
 */
export interface HabitWithCompletion extends Habit {
  isCompletedToday: boolean;
  currentStreak: number;
  completedThisMonth: number;
}

/**
 * Habits hook for managing habits
 */
export const useHabits = () => {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

  /**
   * Fetch all habits
   */
  const {
    data: habits = [],
    isLoading: isLoadingHabits,
    refetch: refetchHabits,
  } = useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: () => habitApi.getAll(false),
  });

  /**
   * Fetch today's completions
   */
  const { data: todayCompletions = [] } = useQuery({
    queryKey: ['completions', 'today'],
    queryFn: () => completionApi.getAll({ startDate: today, endDate: today }),
  });

  /**
   * Fetch this month's completions
   */
  const { data: monthCompletions = [] } = useQuery({
    queryKey: ['completions', 'month', monthStart],
    queryFn: () => completionApi.getAll({ startDate: monthStart, endDate: monthEnd }),
  });

  /**
   * Fetch stats for all habits (parallel requests)
   */
  const { data: habitsStats = [], isLoading: isLoadingStats } = useQuery({
    queryKey: ['habitStats', habits.map((h) => h.id).join(',')],
    queryFn: async () => {
      if (habits.length === 0) return [];
      const statsPromises = habits.map((habit) => habitApi.getStats(habit.id));
      return Promise.all(statsPromises);
    },
    enabled: habits.length > 0,
  });

  /**
   * Augment habits with completion and stats data
   */
  const habitsWithCompletion: HabitWithCompletion[] = habits.map((habit) => {
    const isCompletedToday = todayCompletions.some((c) => c.habitId === habit.id);
    const completedThisMonth = monthCompletions.filter((c) => c.habitId === habit.id).length;
    const stats = habitsStats.find((s) => s.id === habit.id);

    return {
      ...habit,
      isCompletedToday,
      currentStreak: stats?.currentStreak || 0,
      completedThisMonth,
    };
  });

  /**
   * Create habit mutation
   */
  const createHabitMutation = useMutation({
    mutationFn: (data: CreateHabitData) => habitApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  /**
   * Update habit mutation
   */
  const updateHabitMutation = useMutation({
    mutationFn: ({ habitId, data }: { habitId: string; data: UpdateHabitData }) =>
      habitApi.update(habitId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  /**
   * Delete habit mutation
   */
  const deleteHabitMutation = useMutation({
    mutationFn: (habitId: string) => habitApi.deleteHabit(habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  return {
    // Data
    habits: habitsWithCompletion,
    rawHabits: habits,

    // Loading states
    isLoading: isLoadingHabits || isLoadingStats,
    isLoadingHabits,

    // Refetch
    refetch: refetchHabits,

    // Mutations
    createHabit: createHabitMutation.mutate,
    updateHabit: updateHabitMutation.mutate,
    deleteHabit: deleteHabitMutation.mutate,

    // Mutation states
    isCreating: createHabitMutation.isPending,
    isUpdating: updateHabitMutation.isPending,
    isDeleting: deleteHabitMutation.isPending,
  };
};
