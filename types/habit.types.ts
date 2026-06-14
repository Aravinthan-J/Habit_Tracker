export type HabitFrequency = 'daily' | 'weekly';

export interface Habit {
    id: string;
    user_id: string;
    title: string;
    monthly_goal: number;
    color: string;
    icon: string | null;
    notifications_enabled: boolean;
    reminder_time: string | null;
    /** How often the habit should be done. 'weekly' = once per calendar week. */
    frequency?: HabitFrequency;
    /** Learn the user's typical completion time and remind around it. */
    smart_reminder?: boolean;
    /** Habit stacking: id of the habit this one should follow. */
    stack_after?: string | null;
    created_at: string;
    updated_at: string;
    archived_at: string | null;
}

export interface HabitInsert {
    id?: string;
    user_id: string;
    title: string;
    monthly_goal?: number;
    color?: string;
    icon?: string | null;
    notifications_enabled?: boolean;
    reminder_time?: string | null;
    frequency?: HabitFrequency;
    smart_reminder?: boolean;
    stack_after?: string | null;
    created_at?: string;
    updated_at?: string;
    archived_at?: string | null;
}

export interface HabitUpdate {
    id?: string;
    user_id?: string;
    title?: string;
    monthly_goal?: number;
    color?: string;
    icon?: string | null;
    notifications_enabled?: boolean;
    reminder_time?: string | null;
    frequency?: HabitFrequency;
    smart_reminder?: boolean;
    stack_after?: string | null;
    updated_at?: string;
    archived_at?: string | null;
}

export interface Completion {
    id: string;
    habit_id: string;
    user_id: string;
    date: string;
    completed_at: string;
}

export interface CompletionInsert {
    id?: string;
    habit_id: string;
    user_id: string;
    date: string;
    completed_at?: string;
}

export interface HabitWithCompletions extends Habit {
    completions: Completion[];
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    completedToday: boolean;
    monthlyCompletionRate: number;
}

export interface HabitStats {
    habitId: string;
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    completionRateLast30Days: number;
    lastCompletedDate: string | null;
}

export type SyncOperation = {
    id?: number;
    operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'SET' | 'ARRAY_UNION' | 'ARRAY_REMOVE';
    table_name: 'habits' | 'completions' | 'daily';
    record_id: string;
    payload: string;
    created_at?: string;
    attempts?: number;
};
