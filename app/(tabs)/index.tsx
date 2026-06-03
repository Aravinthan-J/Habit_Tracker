import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useHabits } from '@/hooks/useHabits';
import { useCompletions } from '@/hooks/useCompletions';
import { useSteps } from '@/hooks/useSteps';
import { useBadges } from '@/hooks/useBadges';
import { HabitCard } from '@/components/habits/HabitCard';
import { StepProgressRing } from '@/components/steps/StepProgressRing';
import AchievementPreview from '@/components/home/AchievementPreview';
import FocusHighlights from '@/components/home/FocusHighlights';
import MetricHighlights from '@/components/home/MetricHighlights';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { today } from '@/utils/dateHelpers';
import { calculateCurrentStreakWithFreezes } from '@/utils/streakCalculator';
import { useAuthStore } from '@/store/authStore';
import { useAdvancedFeatures } from '@/hooks/useAdvancedFeatures';
import { useStreakFreeze } from '@/hooks/useStreakFreeze';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { habits, isLoading: habitsLoading, refetch: refetchHabits } = useHabits();
  const { completions, toggleCompletion } = useCompletions();
  const { todaySteps, liveSteps, isPedometerAvailable } = useSteps();
  const { checkForNewBadges } = useBadges();
  const { recentAchievements, focusSessions, isLoading: advancedLoading, refetch: refetchAdvanced } = useAdvancedFeatures();
  const { balance: freezeBalance, maxFreezes, freezeDates } = useStreakFreeze();

  const todayStr = today();
  const currentMonth = useMemo(() => todayStr.slice(0, 7), [todayStr]);
  const activeHabitIds = useMemo(() => new Set(habits.map((h) => h.id)), [habits]);

  const completedTodayIds = useMemo(
    () => new Set(
      completions
        .filter((c) => c.date === todayStr && activeHabitIds.has(c.habit_id))
        .map((c) => c.habit_id)
    ),
    [completions, todayStr, activeHabitIds]
  );

  // Pre-compute per-habit maps once — avoids O(n×m) filtering inside renderItem
  const completionDatesByHabitId = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const c of completions) {
      if (!map.has(c.habit_id)) map.set(c.habit_id, []);
      map.get(c.habit_id)!.push(c.date);
    }
    return map;
  }, [completions]);

  const monthlyCountByHabitId = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of completions) {
      if (c.date.startsWith(currentMonth)) {
        map.set(c.habit_id, (map.get(c.habit_id) ?? 0) + 1);
      }
    }
    return map;
  }, [completions, currentMonth]);

  const completedCount = completedTodayIds.size;
  const totalCount = habits.length;
  const allDone = totalCount > 0 && completedCount === totalCount;
  const stepGoal = 10000;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const handleToggle = useCallback(async (habitId: string) => {
    const isCompleted = completedTodayIds.has(habitId);
    await toggleCompletion.mutateAsync({ habitId, date: todayStr, isCompleted });
    if (!isCompleted) {
      await checkForNewBadges(habitId);
    }
  }, [completedTodayIds, todayStr, toggleCompletion, checkForNewBadges]);

  const handleRefresh = async () => {
    await Promise.all([refetchHabits(), refetchAdvanced()]);
  };

  const totalFocusMinutes = focusSessions.reduce((acc: number, s: any) => acc + s.duration, 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: COLORS.background }]}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={habitsLoading || advancedLoading} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
        ListHeaderComponent={() => (
          <View>
            {/* Header */}
            <LinearGradient
              colors={[COLORS.surface, COLORS.background]}
              style={styles.header}
            >
              <View>
                <Text style={[styles.greeting, { color: COLORS.textMuted }]}>{greeting},</Text>
                <Text style={[styles.name, { color: COLORS.textPrimary }]}>{user?.displayName ?? 'there'} 👋</Text>
              </View>
              <View
                style={[styles.freezePill, { backgroundColor: COLORS.surface, borderColor: COLORS.cardBorder }]}
                accessibilityLabel={`${freezeBalance} of ${maxFreezes} streak freezes available`}
              >
                <Text style={styles.freezeIcon}>🧊</Text>
                <Text style={[styles.freezeCount, { color: COLORS.textPrimary }]}>{freezeBalance}</Text>
              </View>
            </LinearGradient>

            {/* Progress banner */}
            {totalCount > 0 && (
              <View style={styles.progressBanner}>
                <View style={styles.progressTextRow}>
                  <Text style={[styles.progressText, { color: COLORS.textSecondary }]}>
                    {completedCount}/{totalCount} habits done
                  </Text>
                  {allDone && <Text style={styles.allDone}>All done! 🎉</Text>}
                </View>
                <View style={[styles.progressTrack, { backgroundColor: COLORS.surface }]}>
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
            <View style={[styles.stepSection, { backgroundColor: COLORS.card, borderColor: COLORS.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>Steps Today</Text>
              <StepProgressRing
                steps={Math.max(liveSteps, todaySteps?.steps ?? 0)}
                goal={stepGoal}
                size={160}
              />
              <View style={styles.stepMetricsRow}>
                <View style={styles.stepMetric}>
                  <Text style={[styles.stepMetricValue, { color: COLORS.textPrimary }]}>
                    {(todaySteps?.distance ?? 0).toFixed(2)}
                  </Text>
                  <Text style={[styles.stepMetricLabel, { color: COLORS.textMuted }]}>km</Text>
                </View>
                <View style={[styles.stepMetricDivider, { backgroundColor: COLORS.cardBorder }]} />
                <View style={styles.stepMetric}>
                  <Text style={[styles.stepMetricValue, { color: COLORS.textPrimary }]}>
                    {todaySteps?.calories ?? 0}
                  </Text>
                  <Text style={[styles.stepMetricLabel, { color: COLORS.textMuted }]}>kcal</Text>
                </View>
              </View>
              {!isPedometerAvailable && (
                <Text style={[styles.pedometerHint, { color: COLORS.textMuted }]}>Pedometer not available on this device</Text>
              )}
            </View>

            {/* Achievement Preview */}
            <AchievementPreview achievements={recentAchievements as any} />

            {/* Focus Highlights */}
            {totalFocusMinutes > 0 && (
              <FocusHighlights totalMinutes={totalFocusMinutes} sessionsCount={focusSessions.length} />
            )}

            <Text style={[styles.habitsTitle, { color: COLORS.textPrimary }]}>Today's Habits</Text>

            {habitsLoading && <LoadingState count={3} />}
          </View>
        )}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        renderItem={({ item }) => {
          const completionDates = completionDatesByHabitId.get(item.id) ?? [];
          const monthlyCount = monthlyCountByHabitId.get(item.id) ?? 0;
          return (
            <HabitCard
              habit={item}
              isCompleted={completedTodayIds.has(item.id)}
              streak={calculateCurrentStreakWithFreezes(completionDates, freezeDates)}
              onToggle={() => handleToggle(item.id)}
              onPress={() => { }}
              monthlyCount={monthlyCount}
              monthlyGoal={item.monthly_goal}
            />
          );
        }}
        ListEmptyComponent={
          !habitsLoading ? (
            <EmptyState
              icon="add-circle-outline"
              title="No habits yet"
              subtitle="Go to the Habits tab to create your first habit and start building your routine."
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
  freezePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  freezeIcon: { fontSize: 16, marginRight: 4 },
  freezeCount: { fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.bold },
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
  stepMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  stepMetric: { alignItems: 'center', paddingHorizontal: SPACING.xl },
  stepMetricValue: { fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold },
  stepMetricLabel: {
    fontSize: TYPOGRAPHY.xs,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepMetricDivider: { width: 1, height: 28 },
  pedometerHint: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.xs,
    marginTop: SPACING.sm,
    textAlign: 'center',
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
