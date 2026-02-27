import { Database } from './database.types';

export type Metric = Database['public']['Tables']['custom_metrics']['Row'];
export type MetricInsert = Database['public']['Tables']['custom_metrics']['Insert'];
export type MetricUpdate = Database['public']['Tables']['custom_metrics']['Update'];

export type MetricLog = Database['public']['Tables']['metric_logs']['Row'];
export type MetricLogInsert = Database['public']['Tables']['metric_logs']['Insert'];

export type FocusSession = Database['public']['Tables']['focus_sessions']['Row'];
export type FocusSessionInsert = Database['public']['Tables']['focus_sessions']['Insert'];

export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type AchievementInsert = Database['public']['Tables']['achievements']['Insert'];

export interface FocusSessionStats {
    totalDuration: number;
    sessionCount: number;
    completionRate: number;
}
