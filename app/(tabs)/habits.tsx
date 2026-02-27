import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '@/hooks/useHabits';
import { useCompletions } from '@/hooks/useCompletions';
import { HabitCard } from '@/components/habits/HabitCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useUIStore } from '@/store/uiStore';
import { today } from '@/utils/dateHelpers';
import { calculateCurrentStreak } from '@/utils/streakCalculator';

export default function HabitsScreen() {
  const router = useRouter();
  const { habits, isLoading } = useHabits();
  const { completions, toggleCompletion } = useCompletions();
  const { premiumTheme } = useUIStore();
  const themeColors = premiumTheme?.colors || COLORS;
  const todayStr = today();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHabits = useMemo(() => {
    if (!searchQuery) return habits;
    return habits.filter(h =>
      h.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [habits, searchQuery]);

  const completedTodayIds = new Set(
    completions.filter((c) => c.date === todayStr).map((c) => c.habit_id)
  );

  const handleToggle = (habitId: string) => {
    const isCompleted = completedTodayIds.has(habitId);
    toggleCompletion.mutate({ habitId, date: todayStr, isCompleted });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]}>
      <LinearGradient
        colors={[themeColors.surface, themeColors.background]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>My Habits</Text>
            <Text style={[styles.count, { color: themeColors.textSecondary }]}>
              {habits.length} routines active
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/habit/new')}
            style={[styles.addBtn, { backgroundColor: themeColors.primary }]}
            accessibilityLabel="Create new habit"
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {habits.length > 5 && (
          <View style={[styles.searchContainer, { backgroundColor: themeColors.surface + '88', borderColor: themeColors.cardBorder || COLORS.cardBorder }]}>
            <Ionicons name="search-outline" size={18} color={themeColors.textMuted} style={styles.searchIcon} />
            <TextInput
              placeholder="Search habits..."
              placeholderTextColor={themeColors.textMuted}
              style={[styles.searchInput, { color: themeColors.textPrimary }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={themeColors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </LinearGradient>

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
          data={filteredHabits}
          keyExtractor={(item) => item.id}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
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
  safe: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: { fontSize: TYPOGRAPHY.xxxl, fontWeight: TYPOGRAPHY.bold },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  count: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    marginTop: 2,
    opacity: 0.8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginTop: SPACING.sm,
  },
  searchIcon: { marginRight: SPACING.xs },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.md,
    paddingVertical: 8,
  },
});
