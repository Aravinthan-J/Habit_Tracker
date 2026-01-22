/**
 * Home Screen - Today View
 * Shows today's habits with checkboxes
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useHabits, useHabitStats } from '../../hooks/useHabits';
import { useTodayCompletions, useToggleCompletion } from '../../hooks/useCompletions';
import { LoadingSpinner } from '../../components/common';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

export function HomeScreen() {
  const { user } = useAuthStore();
  const { data: habits, isLoading: habitsLoading, refetch: refetchHabits } = useHabits();
  const { data: completions, isLoading: completionsLoading, refetch: refetchCompletions } = useTodayCompletions();
  const { markComplete, unmarkComplete, isLoading: toggleLoading } = useToggleCompletion();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
  const onRefresh = async () => {
    await Promise.all([refetchHabits(), refetchCompletions()]);
  };

  const toggleHabit = async (habitId: string, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await unmarkComplete({ habitId, date: today });
      } else {
        await markComplete({ habitId, date: today });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update habit');
    }
  };

  const isLoading = habitsLoading || completionsLoading;
  const isRefreshing = isLoading && (habits || completions);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };



  if (isLoading && !habits) {
    return <LoadingSpinner fullScreen message="Loading habits..." />;
  }

  const habitsList = habits || [];
  const completionsList = completions || [];
  const completedHabitIds = new Set(completionsList.map(c => c.habitId));

  const habitsWithCompletion = habitsList.map(habit => ({
    ...habit,
    completed: completedHabitIds.has(habit.id),
  }));

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={!!isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}, {user?.name || 'User'}!</Text>
          <Text style={styles.date}>{todayDate}</Text>
        </View>

        {/* Today's Habits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Habits</Text>

          {habitsWithCompletion.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No habits yet!</Text>
              <Text style={styles.emptySubtext}>Go to Habits tab to add your first habit</Text>
            </View>
          ) : (
            habitsWithCompletion.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                style={[
                  styles.habitCard,
                  habit.completed && styles.habitCardCompleted,
                ]}
                onPress={() => toggleHabit(habit.id, habit.completed)}
                disabled={toggleLoading}
              >
                {/* Checkbox */}
                <View style={styles.checkbox}>
                  {habit.completed ? (
                    <View style={[styles.checkboxChecked, { backgroundColor: habit.color }]}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  ) : (
                    <View style={[styles.checkboxUnchecked, { borderColor: habit.color }]} />
                  )}
                </View>

                {/* Habit Info */}
                <View style={styles.habitInfo}>
                  <Text style={[
                    styles.habitTitle,
                    habit.completed && styles.habitTitleCompleted,
                  ]}>
                    {habit.icon} {habit.title}
                  </Text>
                </View>

                {/* Color Indicator */}
                <View style={[styles.colorIndicator, { backgroundColor: habit.color }]} />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Progress Summary */}
        {habitsWithCompletion.length > 0 && (
          <View style={styles.summary}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>
                {habitsWithCompletion.filter(h => h.completed).length}/{habitsWithCompletion.length}
              </Text>
              <Text style={styles.summaryLabel}>Completed Today</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>
                {Math.round((habitsWithCompletion.filter(h => h.completed).length / habitsWithCompletion.length) * 100) || 0}%
              </Text>
              <Text style={styles.summaryLabel}>Completion Rate</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  habitCardCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    marginRight: spacing.md,
  },
  checkboxUnchecked: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  checkboxChecked: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: colors.white,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  habitTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  streak: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  colorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
  },
  summary: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
