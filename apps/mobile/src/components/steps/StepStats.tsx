/**
 * Step Stats Component
 * Displays step statistics in a card format
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import type { StepStats as StepStatsType } from '@habit-tracker/api-client';

interface StepStatsProps {
  stats: StepStatsType | null;
  isLoading?: boolean;
}

export function StepStats({ stats, isLoading }: StepStatsProps) {
  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.loadingText}>Loading stats...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>No step data available</Text>
      </View>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatDistance = (km: number) => {
    if (km >= 1000) return `${(km / 1000).toFixed(1)}K km`;
    return `${km.toFixed(1)} km`;
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Step Statistics</Text>
      
      <View style={styles.statsGrid}>
        {/* Total Steps */}
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>👣</Text>
          <Text style={styles.statValue}>{formatNumber(stats.totalSteps)}</Text>
          <Text style={styles.statLabel}>Total Steps</Text>
        </View>

        {/* Total Distance */}
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>📍</Text>
          <Text style={styles.statValue}>{formatDistance(stats.totalDistance)}</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>

        {/* Average Steps */}
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>📊</Text>
          <Text style={styles.statValue}>{formatNumber(Math.round(stats.averageStepsPerDay))}</Text>
          <Text style={styles.statLabel}>Daily Average</Text>
        </View>

        {/* Current Streak */}
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      {/* Best Day */}
      {stats.bestDay && (
        <View style={styles.bestDayContainer}>
          <Text style={styles.bestDayLabel}>🏆 Best Day</Text>
          <Text style={styles.bestDayValue}>
            {new Date(stats.bestDay.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
            {' - '}
            {stats.bestDay.steps.toLocaleString()} steps
          </Text>
        </View>
      )}

      {/* Additional Stats */}
      <View style={styles.additionalStats}>
        <View style={styles.additionalStatItem}>
          <Text style={styles.additionalStatLabel}>Longest Streak</Text>
          <Text style={styles.additionalStatValue}>{stats.longestStreak} days</Text>
        </View>
        <View style={styles.additionalStatItem}>
          <Text style={styles.additionalStatLabel}>Days with Goal</Text>
          <Text style={styles.additionalStatValue}>{stats.daysWithGoal}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statItem: {
    width: '47%',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  statIcon: {
    fontSize: typography.fontSize.xl,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bestDayContainer: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  bestDayLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  bestDayValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  additionalStatItem: {
    flex: 1,
  },
  additionalStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  additionalStatValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
});
