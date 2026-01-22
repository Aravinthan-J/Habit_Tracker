/**
 * Insight Card Component
 * Displays AI-generated insights
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import type { Insight } from '@habit-tracker/api-client';

interface InsightCardProps {
  insight: Insight;
}

const ICON_MAP: Record<string, string> = {
  trophy: '🏆',
  fire: '🔥',
  'trending-up': '📈',
  'trending-down': '📉',
  'check-circle': '✅',
  star: '⭐',
};

const COLOR_MAP: Record<string, string> = {
  best_day: colors.primary,
  streak: '#FF6B35',
  improvement: colors.success,
  decline: colors.warning,
  consistency: colors.secondary,
  milestone: '#FFD700',
};

export function InsightCard({ insight }: InsightCardProps) {
  const icon = ICON_MAP[insight.icon] || '💡';
  const color = COLOR_MAP[insight.type] || colors.primary;

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>{insight.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  icon: {
    fontSize: typography.fontSize.xxl,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
});
