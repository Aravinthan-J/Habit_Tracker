/**
 * Badge Card Component
 * Displays a single badge (earned or locked)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BADGE_ICONS, TIER_COLORS } from '../../constants/badges';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';

interface Badge {
  id: string;
  name: string;
  description: string;
  type: string;
  tier: string;
  requirement: number;
  iconName: string;
}

interface BadgeProgress {
  current: number;
  required: number;
  percentage: number;
}

interface BadgeCardProps {
  badge: Badge & {
    isEarned: boolean;
    earnedAt?: string;
    progress?: BadgeProgress;
  };
  onPress: () => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function BadgeCard({ badge, onPress }: BadgeCardProps) {
  const tierColor = TIER_COLORS[badge.tier as keyof typeof TIER_COLORS];
  const icon = BADGE_ICONS[badge.iconName];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {badge.isEarned ? (
        // EARNED BADGE - Full color with glow
        <LinearGradient
          colors={[tierColor + 'AA', tierColor + 'FF']}
          style={styles.card}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.iconLarge}>{icon}</Text>
            <View style={[styles.glowRing, { borderColor: tierColor }]} />
          </View>

          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.tier}>{badge.tier.toUpperCase()}</Text>

          <Text style={styles.earnedDate}>
            Earned {formatDate(badge.earnedAt)}
          </Text>

          {/* Checkmark overlay */}
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        </LinearGradient>
      ) : (
        // LOCKED BADGE - Grayscale with progress
        <View style={[styles.card, styles.cardLocked]}>
          <View style={styles.iconContainer}>
            <Text style={[styles.iconLarge, styles.iconGray]}>
              {icon}
            </Text>
            {/* Lock icon overlay */}
            <View style={styles.lockIcon}>
              <Text style={styles.lockEmoji}>🔒</Text>
            </View>
          </View>

          <Text style={[styles.badgeName, styles.textGray]}>
            {badge.name}
          </Text>
          <Text style={[styles.tier, styles.textGray]}>
            {badge.tier.toUpperCase()}
          </Text>

          {/* Progress bar */}
          {badge.progress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${badge.progress.percentage}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {badge.progress.current}/{badge.progress.required}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    aspectRatio: 0.75,
    marginBottom: spacing.lg,
    marginHorizontal: '1%',
  },
  card: {
    flex: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  cardLocked: {
    backgroundColor: '#E0E0E0',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  iconLarge: {
    fontSize: 48,
  },
  iconGray: {
    opacity: 0.3,
  },
  glowRing: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 40,
    borderWidth: 2,
  },
  lockIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: spacing.md,
    padding: spacing.xs,
  },
  lockEmoji: {
    fontSize: 16,
  },
  badgeName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.xs,
    color: colors.white,
  },
  tier: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    color: colors.white,
  },
  earnedDate: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    opacity: 0.9,
  },
  textGray: {
    color: '#999',
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.success,
    borderRadius: borderRadius.xl,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  progressContainer: {
    width: '100%',
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#DDD',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    color: '#999',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
