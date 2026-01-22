/**
 * Badge Constants
 * Badge icons, tier colors, and categories
 */

export const BADGE_ICONS: Record<string, string> = {
  'fire-bronze': '🔥',
  'fire-silver': '🔥',
  'fire-gold': '🔥',
  'fire-platinum': '🔥',
  'calendar-check': '✅',
  'calendar-star': '⭐',
  'refresh': '🔄',
  'sunrise': '🌅',
  'moon': '🌙',
  'trophy-bronze': '🥉',
  'trophy-silver': '🥈',
  'trophy-gold': '🥇',
  'trophy-platinum': '🏆',
  'walk': '🚶',
  'run': '🏃',
  'footsteps-bronze': '👣',
  'footsteps-silver': '👣',
  'footsteps-gold': '👣',
  'map-bronze': '🗺️',
  'map-silver': '🗺️',
  'map-gold': '🗺️',
  'collection': '📚',
  'weekend': '🎉',
  'crown': '👑',
  'sun': '☀️',
  'rainbow': '🌈',
  'star-gold': '⭐',
  'lightning': '⚡',
  'medal': '🏅',
  'gem': '💎',
};

export const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
};

export interface BadgeCategory {
  id: string;
  name: string;
  icon: string;
}

export const BADGE_CATEGORIES: BadgeCategory[] = [
  { id: 'all', name: 'All Badges', icon: '🏆' },
  { id: 'streak', name: 'Streaks', icon: '🔥' },
  { id: 'completion', name: 'Completions', icon: '✅' },
  { id: 'volume', name: 'Volume', icon: '📊' },
  { id: 'step', name: 'Steps', icon: '🚶' },
  { id: 'special', name: 'Special', icon: '⭐' },
];
