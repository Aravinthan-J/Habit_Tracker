export interface Metric {
    id: string;
    user_id: string;
    habit_id: string | null;
    name: string;
    type: 'numeric' | 'boolean' | 'slider' | 'time';
    unit: string;
    target_value: number | null;
    created_at: string;
}

export interface MetricInsert {
    id?: string;
    user_id: string;
    habit_id?: string | null;
    name: string;
    type?: 'numeric' | 'boolean' | 'slider' | 'time';
    unit: string;
    target_value?: number | null;
    created_at?: string;
}

export interface MetricUpdate {
    name?: string;
    type?: 'numeric' | 'boolean' | 'slider' | 'time';
    unit?: string;
    target_value?: number | null;
}

export interface MetricLog {
    id: string;
    metric_id: string;
    user_id: string;
    value: number;
    date: string;
    created_at: string;
}

export interface MetricLogInsert {
    id?: string;
    metric_id: string;
    user_id: string;
    value: number;
    date: string;
    created_at?: string;
}

export interface FocusSession {
    id: string;
    user_id: string;
    duration: number;
    started_at: string;
    ended_at: string;
    interrupted: boolean;
}

export interface FocusSessionInsert {
    id?: string;
    user_id: string;
    duration: number;
    started_at: string;
    ended_at: string;
    interrupted: boolean;
}

export interface Achievement {
    id: string;
    user_id: string;
    title: string;
    description: string;
    icon: string;
    earned_at: string;
}

export interface AchievementInsert {
    id?: string;
    user_id: string;
    title: string;
    description: string;
    icon: string;
    earned_at?: string;
}

export interface FocusSessionStats {
    totalDuration: number;
    sessionCount: number;
    completionRate: number;
}
