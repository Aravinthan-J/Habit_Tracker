import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';
import { Habit, CreateHabitData, UpdateHabitData, HabitWithStats } from '@habit-tracker/shared-types';
import { format } from 'date-fns';

const habitApiService = apiClient.habit;
const completionApiService = apiClient.completion;

interface AugmentedHabit extends Habit {
  isCompletedToday: boolean;
  streak: number;
}

export const useHabits = () => {
  const queryClient = useQueryClient();

  const { data: habits = [], isLoading: isLoadingHabits } = useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: () => habitApiService.getAll(),
  });
  
  const { data: habitStats, isLoading: isLoadingStats } = useQuery<HabitWithStats[]>({
    queryKey: ['habitStats'],
    queryFn: () => Promise.all(habits.map(h => habitApiService.getStats(h.id))),
    enabled: !!habits && habits.length > 0,
  });

  const { data: todayCompletions = [], isLoading: isLoadingCompletions } = useQuery({
    queryKey: ['todayCompletions'],
    queryFn: () => completionApiService.getAll({ date: format(new Date(), 'yyyy-MM-dd') }),
  });
  
  const augmentedHabits = habits.map(habit => {
    const stats = habitStats?.find(s => s.id === habit.id);
    const isCompletedToday = todayCompletions.some(c => c.habitId === habit.id);
    return {
      ...habit,
      isCompletedToday,
      streak: stats?.currentStreak ?? 0,
    };
  });

  const { mutate: createHabit } = useMutation({
    mutationFn: (newHabit: CreateHabitData) => habitApiService.create(newHabit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const { mutate: updateHabit } = useMutation({
    mutationFn: ({ habitId, data }: { habitId: string; data: UpdateHabitData }) => habitApiService.update(habitId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const { mutate: deleteHabit } = useMutation({
    mutationFn: (habitId: string) => habitApiService.delete(habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  return {
    habits: augmentedHabits,
    isLoadingHabits: isLoadingHabits || isLoadingStats || isLoadingCompletions,
    createHabit,
    updateHabit,
    deleteHabit,
  };
};
