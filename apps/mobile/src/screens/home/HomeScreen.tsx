import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { colors, spacing, typography, shadows } from '../../constants/theme';
import { useHabits } from '../../hooks/useHabits';
import { useCompletions } from '../../hooks/useCompletions';
import { LoadingSpinner, EmptyState } from '../../components/common';
import HabitCard from '../../components/habits/HabitCard';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

/**
 * Home Screen - Display today's habits with completion tracking
 */
const HomeScreen = ({ navigation }: any) => {
  const { habits, isLoading, refetch } = useHabits();
  const { toggleCompletion } = useCompletions();

  // Calculate stats
  const completedToday = useMemo(
    () => habits.filter((h) => h.isCompletedToday).length,
    [habits]
  );
  const totalHabits = habits.length;
  const completionPercentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const activeStreaks = useMemo(
    () => habits.filter((h) => h.currentStreak > 0).length,
    [habits]
  );

  // Motivational message
  const getMotivationalMessage = () => {
    if (totalHabits === 0) return 'Start building great habits!';
    if (completedToday === 0) return "Let's get started!";
    if (completedToday === totalHabits) return "Amazing! All done for today! 🎉";
    if (completionPercentage >= 75) return "You're crushing it! Keep going!";
    if (completionPercentage >= 50) return 'Great progress! Almost there!';
    return 'Good start! Keep it up!';
  };

  // Handle habit completion toggle
  const handleToggleCompletion = (habitId: string) => {
    toggleCompletion(habitId);
  };

  // Handle habit card press (navigate to detail)
  const handleHabitPress = (habitId: string) => {
    // TODO: Navigate to habit detail screen
    console.log('Navigate to habit detail:', habitId);
  };

  // Handle add habit button
  const handleAddHabit = () => {
    // TODO: Navigate to add habit screen
    console.log('Navigate to add habit screen');
  };

  // Loading state
  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading habits..." />;
  }

  // Empty state
  if (habits.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="trophy-outline"
          title="No habits yet"
          message="Start building great habits today! Tap the button below to create your first habit."
          actionLabel="Create Your First Habit"
          onAction={handleAddHabit}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Date and Title */}
            <View style={styles.titleSection}>
              <Text style={styles.date}>{format(new Date(), 'EEEE, MMM d, yyyy')}</Text>
              <Text style={styles.title}>Today's Habits</Text>
            </View>

            {/* Stats Card */}
            <View style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {completedToday}/{totalHabits}
                  </Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{completionPercentage}%</Text>
                  <Text style={styles.statLabel}>Progress</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>🔥 {activeStreaks}</Text>
                  <Text style={styles.statLabel}>Streaks</Text>
                </View>
              </View>

              {/* Motivational Message */}
              <Text style={styles.motivationalMessage}>{getMotivationalMessage()}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <HabitCard
            id={item.id}
            title={item.title}
            icon={item.icon}
            color={item.color}
            monthlyGoal={item.monthlyGoal}
            completedThisMonth={item.completedThisMonth}
            currentStreak={item.currentStreak}
            isCompletedToday={item.isCompletedToday}
            onToggleCompletion={handleToggleCompletion}
            onPress={() => handleHabitPress(item.id)}
          />
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddHabit} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  titleSection: {
    marginBottom: spacing.md,
  },
  date: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  statsCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.md,
    padding: spacing.lg,
    ...shadows.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  motivationalMessage: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
});

export default HomeScreen;
