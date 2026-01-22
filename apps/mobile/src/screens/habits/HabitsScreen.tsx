/**
 * Habits Screen
 * Manage all habits with search, sort, and filter
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { HabitsStackParamList } from '../../navigation/HabitsNavigator';
import { useHabits, useDeleteHabit } from '../../hooks/useHabits';
import { LoadingSpinner } from '../../components/common';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

export function HabitsScreen() {
  const navigation = useNavigation<NavigationProp<HabitsStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: habits, isLoading } = useHabits();
  const { mutateAsync: deleteHabit } = useDeleteHabit();

  const habitsList = habits || [];

  const filteredHabits = habitsList.filter((habit) =>
    habit.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (habitId: string) => {
    navigation.navigate('AddEditHabit', { habitId });
  };

  const handleDelete = (habitId: string) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habitId);
              Alert.alert('Success', 'Habit deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete habit');
            }
          },
        },
      ]
    );
  };

  const handleAddNew = () => {
    navigation.navigate('AddEditHabit');
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading habits..." />;
  }

  // For now, show basic progress without stats API call
  // TODO: Enhance with useHabitStats for detailed stats
  const getCurrentMonthProgress = (habit: any) => {
    // This will be replaced with real stats from API
    return {
      current: 0,
      percent: 0,
    };
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search habits..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* Habits List */}
        {filteredHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No habits found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Try a different search term'
                : 'Tap + to create your first habit'}
            </Text>
          </View>
        ) : (
          filteredHabits.map((habit) => {
            const progress = getCurrentMonthProgress(habit);

            return (
              <View key={habit.id} style={styles.habitCard}>
                {/* Header */}
                <View style={styles.habitHeader}>
                  <View style={styles.habitTitleContainer}>
                    <Text style={styles.habitTitle}>{habit.icon} {habit.title}</Text>
                    <View
                      style={[styles.colorIndicator, { backgroundColor: habit.color }]}
                    />
                  </View>
                </View>

                {/* Goal */}
                <Text style={styles.goalText}>
                  Goal: {habit.monthlyGoal} days/month
                </Text>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${progress.percent}%`,
                          backgroundColor: habit.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{progress.percent}%</Text>
                </View>

                {/* Current Progress */}
                <Text style={styles.currentText}>
                  Current: {progress.current}/{habit.monthlyGoal} days this month
                </Text>

                {/* Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEdit(habit.id)}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(habit.id)}
                  >
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddNew}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    paddingBottom: 100, // Space for FAB
  },
  searchContainer: {
    marginBottom: spacing.lg,
  },
  searchInput: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  habitCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  habitHeader: {
    marginBottom: spacing.sm,
  },
  habitTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  habitTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    flex: 1,
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: spacing.sm,
  },
  goalText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: colors.borderLight,
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    minWidth: 40,
    textAlign: 'right',
  },
  currentText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  streakText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.error,
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  deleteButtonText: {
    color: colors.error,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
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
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    fontSize: 32,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
});
