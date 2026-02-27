import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '@/hooks/useHabits';
import { useCompletions } from '@/hooks/useCompletions';
import { HabitCard } from '@/components/habits/HabitCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '@/constants/theme';
import { today } from '@/utils/dateHelpers';
import { calculateCurrentStreak } from '@/utils/streakCalculator';

export default function HabitsScreen() {
  const router = useRouter();
  const { habits, isLoading, archiveHabit } = useHabits();
  const { completions, toggleCompletion } = useCompletions();
  const todayStr = today();

  const completedTodayIds = new Set(
    completions.filter((c) => c.date === todayStr).map((c) => c.habit_id)
  );

  const handleToggle = (habitId: string) => {
    const isCompleted = completedTodayIds.has(habitId);
    toggleCompletion.mutate({ habitId, date: todayStr, isCompleted });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>My Habits</Text>
        <TouchableOpacity
          onPress={() => router.push('/habit/new')}
          style={styles.addBtn}
          accessibilityLabel="Create new habit"
        >
          <Ionicons name="add" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.count}>{habits.length} active habits</Text>

      {isLoading ? (
        <LoadingState count={4} />
      ) : habits.length === 0 ? (
        <EmptyState
          icon="clipboard-outline"
          title="No habits yet"
          subtitle="Build your first habit and start your streak!"
          action={
            <Button title="Create Habit" onPress={() => router.push('/habit/new')} />
          }
        />
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const completionDates = completions
              .filter((c) => c.habit_id === item.id)
              .map((c) => c.date);
            return (
              <HabitCard
                habit={item}
                isCompleted={completedTodayIds.has(item.id)}
                streak={calculateCurrentStreak(completionDates)}
                onToggle={() => handleToggle(item.id)}
                onPress={() => router.push(`/habit/${item.id}`)}
              />
            );
          }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  title: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.xxxl, fontWeight: TYPOGRAPHY.bold },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  count: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sm,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
});
