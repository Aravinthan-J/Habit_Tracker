export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    name: string | null;
                    step_goal: number;
                    reminder_time: string;
                    timezone: string;
                    theme: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    name?: string | null;
                    step_goal?: number;
                    reminder_time?: string;
                    timezone?: string;
                    theme?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string | null;
                    step_goal?: number;
                    reminder_time?: string;
                    timezone?: string;
                    theme?: string;
                    updated_at?: string;
                };
            };
            habits: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    monthly_goal: number;
                    color: string;
                    icon: string | null;
                    notifications_enabled: boolean;
                    reminder_time: string | null;
                    created_at: string;
                    updated_at: string;
                    archived_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    monthly_goal?: number;
                    color?: string;
                    icon?: string | null;
                    notifications_enabled?: boolean;
                    reminder_time?: string | null;
                    created_at?: string;
                    updated_at?: string;
                    archived_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    monthly_goal?: number;
                    color?: string;
                    icon?: string | null;
                    notifications_enabled?: boolean;
                    reminder_time?: string | null;
                    updated_at?: string;
                    archived_at?: string | null;
                };
            };
            completions: {
                Row: {
                    id: string;
                    habit_id: string;
                    user_id: string;
                    date: string;
                    completed_at: string;
                };
                Insert: {
                    id?: string;
                    habit_id: string;
                    user_id: string;
                    date: string;
                    completed_at?: string;
                };
                Update: {
                    id?: string;
                    habit_id?: string;
                    user_id?: string;
                    date?: string;
                    completed_at?: string;
                };
            };
            badges: {
                Row: {
                    id: string;
                    name: string;
                    description: string;
                    type: 'streak' | 'completion' | 'step' | 'special';
                    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
                    requirement: number;
                    icon_name: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description: string;
                    type: 'streak' | 'completion' | 'step' | 'special';
                    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
                    requirement: number;
                    icon_name: string;
                    created_at?: string;
                };
                Update: {
                    name?: string;
                    description?: string;
                    type?: 'streak' | 'completion' | 'step' | 'special';
                    tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
                    requirement?: number;
                    icon_name?: string;
                };
            };
            user_badges: {
                Row: {
                    id: string;
                    user_id: string;
                    badge_id: string;
                    habit_id: string | null;
                    earned_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    badge_id: string;
                    habit_id?: string | null;
                    earned_at?: string;
                };
                Update: {
                    user_id?: string;
                    badge_id?: string;
                    habit_id?: string | null;
                    earned_at?: string;
                };
            };
            step_data: {
                Row: {
                    id: string;
                    user_id: string;
                    date: string;
                    steps: number;
                    distance: number | null;
                    calories: number | null;
                    active_minutes: number | null;
                    source: 'pedometer' | 'manual';
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    date: string;
                    steps: number;
                    distance?: number | null;
                    calories?: number | null;
                    active_minutes?: number | null;
                    source?: 'pedometer' | 'manual';
                    created_at?: string;
                };
                Update: {
                    steps?: number;
                    distance?: number | null;
                    calories?: number | null;
                    active_minutes?: number | null;
                    source?: 'pedometer' | 'manual';
                };
            };
        };
    };
}
