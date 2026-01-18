import { BadgeDefinition, BadgeTier } from '../constants/badges';

/**
 * Returns the tier color based on the badge tier.
 */
export const getTierColor = (tier: BadgeTier): string => {
  const colors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
  };
  return colors[tier] || '#A0A0A0';
};

/**
 * Sorts badges by earned status and then by tier.
 */
export const sortBadges = (badges: BadgeDefinition[], earnedBadgeIds: Set<string>): BadgeDefinition[] => {
  return badges.sort((a, b) => {
    const aIsEarned = earnedBadgeIds.has(a.name);
    const bIsEarned = earnedBadgeIds.has(b.name);

    if (aIsEarned !== bIsEarned) {
      return aIsEarned ? -1 : 1;
    }

    const tierOrder = ['platinum', 'gold', 'silver', 'bronze'];
    return tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier);
  });
};
