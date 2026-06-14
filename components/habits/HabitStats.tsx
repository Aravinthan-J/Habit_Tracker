import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TYPOGRAPHY, SPACING, RADIUS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface HabitStatsProps {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
  color: string;
  monthlyGoal: number;
  monthlyCount: number;
  /** Short unit for streak/count values: 'd' (daily, default) or 'w' (weekly). */
  unit?: 'd' | 'w';
}

const StatBox: React.FC<{ label: string; value: string | number; color: string }> = ({
  label,
  value,
  color,
}) => {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  return (
  <View style={[styles.statBox, { borderColor: color + '44' }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
  );
};

export const HabitStats: React.FC<HabitStatsProps> = ({
  currentStreak,
  longestStreak,
  totalCompletions,
  completionRate,
  color,
  monthlyGoal,
  monthlyCount,
  unit = 'd',
}) => {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  return (
  <View style={styles.grid}>
    <StatBox label="Current Streak" value={`${currentStreak}🔥`} color={color} />
    <StatBox label="Longest Streak" value={`${longestStreak}${unit}`} color={COLORS.gold} />
    <StatBox label="Total Done" value={totalCompletions} color={COLORS.accent} />
    <StatBox
      label="This Month"
      value={monthlyGoal > 0 ? `${monthlyCount}/${monthlyGoal}` : `${monthlyCount}${unit}`}
      color={monthlyGoal > 0 && monthlyCount >= monthlyGoal ? COLORS.success : COLORS.accent}
    />
  </View>
  );
};

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
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
