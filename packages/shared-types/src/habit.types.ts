/**
 * Habit Types
 * Shared habit-related interfaces
 */

export interface Habit {
  id: string;
  userId: string;
  title: string;
  monthlyGoal: number;
  color: string;
  icon: string | null;
  notificationsEnabled: boolean;
  reminderTime: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface CreateHabitData {
  title: string;
  monthlyGoal: number;
  color?: string;
  icon?: string;
  notificationsEnabled?: boolean;
  reminderTime?: string;
}

export interface UpdateHabitData {
  title?: string;
  monthlyGoal?: number;
  color?: string;
  icon?: string;
  notificationsEnabled?: boolean;
  reminderTime?: string | null;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
}

export interface MonthlyProgress {
  completedDays: number;
  totalDays: number;
  percentage: number;
}

export interface HabitWithCompletion extends Habit {
  isCompletedToday: boolean;
  currentStreak: number;
  completedThisMonth: number;
}
