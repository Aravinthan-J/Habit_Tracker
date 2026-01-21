import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { colors, spacing, typography, shadows } from '../../constants/theme';
import { useHabits } from '../../hooks/useHabits';
import { LoadingSpinner, EmptyState, Input } from '../../components/common';
import HabitCard from '../../components/habits/HabitCard';
import { Ionicons } from '@expo/vector-icons';
import { useCompletions } from '../../hooks/useCompletions';

/**
 * Habits List Screen - View all habits with search and filters
 */
const HabitsListScreen = ({ navigation }: any) => {
  const { habits, isLoading, refetch, deleteHabit } = useHabits();
  const { toggleCompletion } = useCompletions();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'streak' | 'progress'>('title');

  // Filter and sort habits
  const filteredHabits = useMemo(() => {
    let result = habits.filter((habit) =>
      habit.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'streak') {
        return b.currentStreak - a.currentStreak;
      } else if (sortBy === 'progress') {
        const progressA = a.completedThisMonth / a.monthlyGoal;
        const progressB = b.completedThisMonth / b.monthlyGoal;
        return progressB - progressA;
      }
      return 0;
    });

    return result;
  }, [habits, searchQuery, sortBy]);

  const handleAddHabit = () => {
    navigation.navigate('AddHabit');
  };

  const handleEditHabit = (habit: any) => {
    navigation.navigate('AddHabit', { habit });
  };

  const handleDeleteHabit = (habitId: string, habitTitle: string) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habitTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteHabit(habitId),
        },
      ]
    );
  };

  const handleHabitPress = (habitId: string) => {
    navigation.navigate('HabitDetail', { habitId });
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading habits..." />;
  }

  if (habits.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="list-outline"
          title="No habits yet"
          message="Create your first habit to get started!"
          actionLabel="Create Habit"
          onAction={handleAddHabit}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Habits</Text>
        <Text style={styles.subtitle}>{habits.length} total</Text>
      </View>

      {/* Search Bar */}
      <Input
        placeholder="Search habits..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        icon="search-outline"
        containerStyle={styles.searchContainer}
      />

      {/* Sort Buttons */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'title' && styles.sortButtonActive]}
          onPress={() => setSortBy('title')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'title' && styles.sortButtonTextActive]}>
            A-Z
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'streak' && styles.sortButtonActive]}
          onPress={() => setSortBy('streak')}
        >
          <Text
            style={[styles.sortButtonText, sortBy === 'streak' && styles.sortButtonTextActive]}
          >
            Streak
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'progress' && styles.sortButtonActive]}
          onPress={() => setSortBy('progress')}
        >
          <Text
            style={[styles.sortButtonText, sortBy === 'progress' && styles.sortButtonTextActive]}
          >
            Progress
          </Text>
        </TouchableOpacity>
      </View>

      {/* Habits List */}
      <FlatList
        data={filteredHabits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No habits found"
            message="Try a different search term"
          />
        }
        renderItem={({ item }) => (
          <View>
            <HabitCard
              id={item.id}
              title={item.title}
              icon={item.icon}
              color={item.color}
              monthlyGoal={item.monthlyGoal}
              completedThisMonth={item.completedThisMonth}
              currentStreak={item.currentStreak}
              isCompletedToday={item.isCompletedToday}
              onToggleCompletion={toggleCompletion}
              onPress={() => handleHabitPress(item.id)}
            />
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditHabit(item)}
              >
                <Ionicons name="create-outline" size={18} color={colors.primary} />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteHabit(item.id, item.title)}
              >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
                <Text style={[styles.actionButtonText, { color: colors.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  searchContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sortLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  sortButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.backgroundDark,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
  },
  sortButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  sortButtonTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginLeft: spacing.md,
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeight.medium,
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

export default HabitsListScreen;
