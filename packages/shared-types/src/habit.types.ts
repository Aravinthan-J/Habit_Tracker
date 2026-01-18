/**
 * Habit entity
 */
export interface Habit {
  id: string;
  userId: string;
  title: string;
  monthlyGoal: number;
  color: string;
  icon: string;
  notificationsEnabled: boolean;
  reminderTime: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  archivedAt: Date | string | null;
}

/**
 * Create habit data
 */
export interface CreateHabitData {
  title: string;
  monthlyGoal?: number;
  color?: string;
  icon?: string;
  notificationsEnabled?: boolean;
  reminderTime?: string | null;
}

/**
 * Update habit data
 */
export interface UpdateHabitData {
  title?: string;
  monthlyGoal?: number;
  color?: string;
  icon?: string;
  notificationsEnabled?: boolean;
  reminderTime?: string | null;
}

/**
 * Habit statistics
 */
export interface HabitStats {
  id: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
}

/**
 * Habit with stats
 */
export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
}

/**
 * Monthly progress data
 */
export interface MonthlyProgress {
  habitId: string;
  month: number;
  year: number;
  completedDays: number;
  goalDays: number;
  percentage: number;
}
