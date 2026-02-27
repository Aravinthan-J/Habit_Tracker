import { Database } from './database.types';

export type Badge = Database['public']['Tables']['badges']['Row'];
export type UserBadge = Database['public']['Tables']['user_badges']['Row'];
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type BadgeType = 'streak' | 'completion' | 'step' | 'special';

export interface BadgeWithStatus extends Badge {
    earned: boolean;
    earned_at: string | null;
    progress?: number; // 0-100 percent
    currentValue?: number;
}

export interface BadgeDefinition {
    name: string;
    description: string;
    type: BadgeType;
    tier: BadgeTier;
    requirement: number;
    icon_name: string;
}
