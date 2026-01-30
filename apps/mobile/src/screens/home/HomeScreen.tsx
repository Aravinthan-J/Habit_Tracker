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
import { useTodayCompletions, useToggleCompletion, useCalendarCompletions } from '../../hooks/useCompletions';
import { useTodaySteps, useStepStats } from '../../hooks/useSteps';
import { LoadingSpinner } from '../../components/common';
import { StepProgressRing, StepStats } from '../../components/steps';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';

export function HomeScreen() {
  const { user } = useAuthStore();
  const { data: habits, isLoading: habitsLoading, refetch: refetchHabits } = useHabits();
  const { data: completions, isLoading: completionsLoading, refetch: refetchCompletions } = useTodayCompletions();
  const { markComplete, unmarkComplete, isLoading: toggleLoading } = useToggleCompletion();
  const { data: todaySteps, isLoading: stepsLoading, refetch: refetchSteps } = useTodaySteps();
  const { data: stepStats, isLoading: statsLoading } = useStepStats();

  // Fetch current month's completions for goal tracking
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const { data: calendarData } = useCalendarCompletions(currentYear, currentMonth);

  // Date in YYYY-MM-DD format for API
  const todayISO = new Date().toISOString().split('T')[0];

  const onRefresh = async () => {
    await Promise.all([refetchHabits(), refetchCompletions(), refetchSteps()]);
  };

  const toggleHabit = async (habitId: string, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await unmarkComplete({ habitId, date: todayISO });
      } else {
        await markComplete({ habitId, date: todayISO });
      }
    } catch (error: any) {
      console.error('Toggle error:', error);
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

  // Check if habit has met its monthly goal
  const hasMetMonthlyGoal = (habit: any) => {
    if (!calendarData?.completions || !Array.isArray(calendarData.completions)) {
      return false;
    }

    // Count how many days this month the habit was completed
    let completedDays = 0;
    calendarData.completions.forEach((dayCompletion: any) => {
      if (dayCompletion.habitIds && dayCompletion.habitIds.includes(habit.id)) {
        completedDays++;
      }
    });

    return completedDays >= habit.monthlyGoal;
  };

  if (isLoading && !habits) {
    return <LoadingSpinner fullScreen message="Loading habits..." />;
  }

  const habitsList = habits || [];
  const completionsList = completions || [];
  const completedHabitIds = new Set(completionsList.map(c => c.habitId));

  // Filter out habits that have met their monthly goal
  const activeHabits = habitsList.filter(habit => !hasMetMonthlyGoal(habit));

  const habitsWithCompletion = activeHabits.map(habit => ({
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

        {/* Step Tracking */}
        {todaySteps && (
          <View style={styles.stepSection}>
            <Text style={styles.sectionTitle}>Steps Today</Text>
            <View style={styles.stepCard}>
              <StepProgressRing
                steps={todaySteps?.steps || 0}
                goal={todaySteps?.stepGoal || 10000}
                size={140}
                strokeWidth={14}
              />
              {(todaySteps?.distance !== undefined && todaySteps?.distance !== null) && (
                <View style={styles.stepDetails}>
                  <View style={styles.stepDetailItem}>
                    <Text style={styles.stepDetailIcon}>📍</Text>
                    <Text style={styles.stepDetailValue}>
                      {todaySteps.distance >= 1
                        ? `${todaySteps.distance.toFixed(2)} km`
                        : `${(todaySteps.distance * 1000).toFixed(0)} m`}
                    </Text>
                  </View>
                  {(todaySteps?.calories !== undefined && todaySteps?.calories !== null) && (
                    <View style={styles.stepDetailItem}>
                      <Text style={styles.stepDetailIcon}>🔥</Text>
                      <Text style={styles.stepDetailValue}>
                        {Math.round(todaySteps.calories)} cal
                      </Text>
                    </View>
                  )}
                  {(todaySteps?.activeMinutes !== undefined && todaySteps?.activeMinutes !== null) && (
                    <View style={styles.stepDetailItem}>
                      <Text style={styles.stepDetailIcon}>⏱️</Text>
                      <Text style={styles.stepDetailValue}>
                        {todaySteps.activeMinutes} min
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Step Statistics */}
        {stepStats && (
          <View style={styles.statsSection}>
            <StepStats stats={stepStats} isLoading={statsLoading} />
          </View>
        )}

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
  stepSection: {
    marginBottom: spacing.xl,
  },
  stepCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  stepDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stepDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepDetailIcon: {
    fontSize: typography.fontSize.lg,
    marginBottom: spacing.xs,
  },
  stepDetailValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  statsSection: {
    marginBottom: spacing.xl,
  },
});
