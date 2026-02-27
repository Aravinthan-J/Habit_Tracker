import { Database } from './database.types';

export type Habit = Database['public']['Tables']['habits']['Row'];
export type HabitInsert = Database['public']['Tables']['habits']['Insert'];
export type HabitUpdate = Database['public']['Tables']['habits']['Update'];

export type Completion = Database['public']['Tables']['completions']['Row'];
export type CompletionInsert = Database['public']['Tables']['completions']['Insert'];

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
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    table_name: 'habits' | 'completions' | 'step_data';
    record_id: string;
    payload: string;
    created_at?: string;
    attempts?: number;
};
