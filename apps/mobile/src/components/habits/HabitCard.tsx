import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';

interface HabitCardProps {
  id: string;
  title: string;
  icon: string;
  color: string;
  monthlyGoal: number;
  completedThisMonth: number;
  currentStreak: number;
  isCompletedToday: boolean;
  onToggleCompletion: (habitId: string) => void;
  onPress?: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({
  id,
  title,
  icon,
  color,
  monthlyGoal,
  completedThisMonth,
  currentStreak,
  isCompletedToday,
  onToggleCompletion,
  onPress,
}) => {
  const progress = monthlyGoal > 0 ? completedThisMonth / monthlyGoal : 0;
  const progressPercentage = Math.round(progress * 100);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isCompletedToday && styles.containerCompleted,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Left side: Icon and Title */}
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
          <View style={styles.titleSection}>
            <Text
              style={[
                styles.title,
                isCompletedToday && styles.titleCompleted,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text style={styles.progressText}>
              {completedThisMonth}/{monthlyGoal} this month • {progressPercentage}%
            </Text>
          </View>
        </View>

        {/* Right side: Checkbox */}
        <Pressable
          style={styles.checkboxContainer}
          onPress={() => onToggleCompletion(id)}
          hitSlop={spacing.md}
        >
          <View
            style={[
              styles.checkbox,
              isCompletedToday && styles.checkboxCompleted,
              { borderColor: color },
              isCompletedToday && { backgroundColor: color },
            ]}
          >
            {isCompletedToday && (
              <Ionicons name="checkmark" size={20} color={colors.white} />
            )}
          </View>
        </Pressable>
      </View>

      {/* Progress Bar */}
      <Progress.Bar
        progress={progress}
        width={null}
        height={6}
        color={color}
        unfilledColor={colors.backgroundDarker}
        borderWidth={0}
        borderRadius={borderRadius.sm}
        style={styles.progressBar}
      />

      {/* Streak Badge */}
      {currentStreak > 0 && (
        <View style={styles.streakBadge}>
          <Text style={styles.streakIcon}>🔥</Text>
          <Text style={styles.streakText}>{currentStreak} day streak</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  containerCompleted: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  checkboxContainer: {
    padding: spacing.xs,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    borderWidth: 0,
  },
  progressBar: {
    marginVertical: spacing.sm,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  streakIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  streakText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
});

export default HabitCard;
