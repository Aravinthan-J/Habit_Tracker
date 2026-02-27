import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';

interface HabitStatsProps {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
  color: string;
}

const StatBox: React.FC<{ label: string; value: string | number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <View style={[styles.statBox, { borderColor: color + '44' }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export const HabitStats: React.FC<HabitStatsProps> = ({
  currentStreak,
  longestStreak,
  totalCompletions,
  completionRate,
  color,
}) => (
  <View style={styles.grid}>
    <StatBox label="Current Streak" value={`${currentStreak}🔥`} color={color} />
    <StatBox label="Longest Streak" value={`${longestStreak}d`} color={COLORS.gold} />
    <StatBox label="Total Done" value={totalCompletions} color={COLORS.accent} />
    <StatBox label="30-Day Rate" value={`${completionRate}%`} color={COLORS.success} />
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.xs,
    marginTop: 4,
    textAlign: 'center',
  },
});
