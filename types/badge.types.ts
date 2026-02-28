export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type BadgeType = 'streak' | 'completion' | 'step' | 'special';

export interface Badge {
    id: string;
    name: string;
    description: string;
    type: BadgeType;
    tier: BadgeTier;
    requirement: number;
    icon_name: string;
    created_at: string;
}

export interface UserBadge {
    id: string;
    user_id: string;
    badge_id: string;
    habit_id: string | null;
    earned_at: string;
}

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
