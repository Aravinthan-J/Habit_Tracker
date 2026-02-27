import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { BadgeWithStatus } from '@/types/badge.types';
import { TIER_COLORS, TIER_GLOW } from '@/constants/badges';
import { Ionicons } from '@expo/vector-icons';

const TIER_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  bronze: 'medal-outline',
  silver: 'ribbon-outline',
  gold: 'trophy-outline',
  platinum: 'diamond-outline',
};

interface BadgeCardProps {
  badge: BadgeWithStatus;
  onPress?: () => void;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge, onPress }) => {
  const tierColor = TIER_COLORS[badge.tier];
  const glowColor = TIER_GLOW[badge.tier];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.wrapper, badge.earned && SHADOWS.glow(tierColor)]}
      accessibilityLabel={`${badge.name} badge, ${badge.earned ? 'earned' : 'locked'}`}
    >
      <View style={[styles.card, { borderColor: badge.earned ? tierColor + '66' : COLORS.cardBorder }]}>
        {badge.earned && (
          <LinearGradient
            colors={[glowColor, 'transparent']}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        <View style={[styles.iconCircle, { backgroundColor: badge.earned ? tierColor + '33' : COLORS.surface }]}>
          <Ionicons
            name={TIER_ICONS[badge.tier]}
            size={28}
            color={badge.earned ? tierColor : COLORS.textMuted}
          />
          {!badge.earned && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={12} color={COLORS.textMuted} />
            </View>
          )}
        </View>
        <Text style={[styles.name, { color: badge.earned ? COLORS.textPrimary : COLORS.textMuted }]} numberOfLines={2}>
          {badge.name}
        </Text>
        <View style={[styles.tierBadge, { backgroundColor: tierColor + '33' }]}>
          <Text style={[styles.tier, { color: tierColor }]}>{badge.tier.toUpperCase()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 140,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 2,
  },
  name: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    lineHeight: 16,
  },
  tierBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  tier: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.bold,
    letterSpacing: 0.5,
  },
});
