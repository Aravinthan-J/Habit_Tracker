import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';
import { useHabits } from '../../hooks/useHabits';
import { useHaptics } from '../../hooks/useHaptics';
import TodayStatsCard from '../../components/home/TodayStatsCard';
import CompletionAnimation from '../../components/celebrations/CompletionAnimation';
import ConfettiAnimation from '../../components/badges/ConfettiAnimation';

const HomeScreen = () => {
  const { habits, isLoadingHabits } = useHabits();
  const haptics = useHaptics();
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Default');
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const completedHabits = useMemo(() => habits.filter(h => h.isCompletedToday).length, [habits]);
  const totalHabits = habits.length;

  const handleHabitCompletion = (habitId: string) => {
    // This is a placeholder for the actual completion logic.
    // In a real app, this would call a mutation from useHabits.
    console.log(`Habit ${habitId} completed!`);
    haptics.light();

    // Trigger animations
    if (completedHabits + 1 === 1) { // First completion of the day
      setShowCompletionAnimation(true);
    } else if (completedHabits + 1 === totalHabits) { // All habits completed
      setShowConfetti(true);
      haptics.success();
    }
  };

  const filteredAndSortedHabits = useMemo(() => {
    let filtered = habits;
    if (filter === 'Active Streaks') {
      filtered = habits.filter(h => h.streak > 0);
    } else if (filter === 'Not Completed') {
      filtered = habits.filter(h => !h.isCompletedToday);
    }
    
    if (sort === 'Alphabetical') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    return filtered;
  }, [habits, filter, sort]);

  const getMotivationalMessage = () => {
    if (completedHabits === 0) return "Let's get the ball rolling!";
    if (completedHabits / totalHabits < 0.5) return 'Good start, keep it up!';
    if (completedHabits === totalHabits) return "You're on fire! Great job!";
    return 'Almost there, you can do it!';
  };

  const activeStreaks = useMemo(() => habits.filter(h => h.streak > 0).length, [habits]);

  return (
    <View style={styles.container}>
      <TodayStatsCard completed={completedHabits} total={totalHabits} />
      
      <View style={styles.header}>
        <Text style={styles.motivationalMessage}>{getMotivationalMessage()}</Text>
        <Text style={styles.streakSummary}>🔥 {activeStreaks} active streaks</Text>
      </View>
      
      <View style={styles.controlsContainer}>
        {/* Add filter and sort buttons here */}
      </View>

      {isLoadingHabits ? (
        <Text>Loading habits...</Text>
      ) : (
        <FlatList
          data={filteredAndSortedHabits}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleHabitCompletion(item.id)}>
              <Text style={styles.habitItem}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <CompletionAnimation 
        isVisible={showCompletionAnimation} 
        onAnimationFinish={() => setShowCompletionAnimation(false)} 
      />
      <ConfettiAnimation 
        isVisible={showConfetti} 
        onAnimationFinish={() => setShowConfetti(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: spacing.md,
  },
  motivationalMessage: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  streakSummary: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  habitItem: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: typography.fontSize.md,
  }
});

export default HomeScreen;
