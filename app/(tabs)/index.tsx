import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useHabits } from '@/hooks/useHabits';
import { useCompletions } from '@/hooks/useCompletions';
import { useSteps } from '@/hooks/useSteps';
import { useBadges } from '@/hooks/useBadges';
import { HabitCard } from '@/components/habits/HabitCard';
import { StepProgressRing } from '@/components/steps/StepProgressRing';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { today } from '@/utils/dateHelpers';
import { calculateCurrentStreak } from '@/utils/streakCalculator';
import { useAuthStore } from '@/store/authStore';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { habits, isLoading: habitsLoading, refetch } = useHabits();
  const { completions, toggleCompletion } = useCompletions();
  const { todaySteps, isPedometerAvailable } = useSteps();
  const { checkForNewBadges } = useBadges();

  const todayStr = today();
  const completedTodayIds = useMemo(
    () => new Set(completions.filter((c) => c.date === todayStr).map((c) => c.habit_id)),
    [completions, todayStr]
  );

  const completedCount = completedTodayIds.size;
  const totalCount = habits.length;
  const allDone = totalCount > 0 && completedCount === totalCount;
  const stepGoal = 10000;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const handleToggle = async (habitId: string) => {
    const isCompleted = completedTodayIds.has(habitId);
    await toggleCompletion.mutateAsync({ habitId, date: todayStr, isCompleted });
    if (!isCompleted) {
      await checkForNewBadges(habitId);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={habitsLoading} onRefresh={refetch} tintColor={COLORS.primary} />
        }
        ListHeaderComponent={() => (
          <View>
            {/* Header */}
            <LinearGradient
              colors={[COLORS.surface, COLORS.background]}
              style={styles.header}
            >
              <View>
                <Text style={styles.greeting}>{greeting},</Text>
                <Text style={styles.name}>{user?.user_metadata?.name ?? 'there'} 👋</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/habit/new')}
                style={styles.addBtn}
                accessibilityLabel="Add new habit"
              >
                <Ionicons name="add" size={28} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </LinearGradient>

            {/* Progress banner */}
            {totalCount > 0 && (
              <View style={styles.progressBanner}>
                <View style={styles.progressTextRow}>
                  <Text style={styles.progressText}>
                    {completedCount}/{totalCount} habits done
                  </Text>
                  {allDone && <Text style={styles.allDone}>All done! 🎉</Text>}
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(completedCount / totalCount) * 100}%`,
                        backgroundColor: allDone ? COLORS.success : COLORS.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Step ring */}
            {isPedometerAvailable && (
              <View style={styles.stepSection}>
                <Text style={styles.sectionTitle}>Steps Today</Text>
                <StepProgressRing
                  steps={todaySteps?.steps ?? 0}
                  goal={stepGoal}
                  size={160}
                />
              </View>
            )}

            <Text style={styles.habitsTitle}>Today's Habits</Text>

            {habitsLoading && <LoadingState count={3} />}
          </View>
        )}
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
        ListEmptyComponent={
          !habitsLoading ? (
            <EmptyState
              icon="add-circle-outline"
              title="No habits yet"
              subtitle="Tap the + button to create your first habit and start building your routine."
            />
          ) : null
        }
        contentContainerStyle={styles.list}
      />
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
    paddingTop: SPACING.lg,
  },
  greeting: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sm },
  name: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.xxl, fontWeight: TYPOGRAPHY.bold },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  progressBanner: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  progressText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm },
  allDone: { color: COLORS.success, fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  stepSection: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
    padding: SPACING.xl,
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  habitsTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  list: { paddingBottom: SPACING.xxxl },
});
