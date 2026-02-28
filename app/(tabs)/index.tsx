import React, { useMemo } from 'react';
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
import { calculateCurrentStreak } from '@/utils/streakCalculator';
import { useUIStore } from '@/store/uiStore';
import { MockDataService } from '@/services/MockDataService';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAdvancedFeatures } from '@/hooks/useAdvancedFeatures';

export default function HomeScreen() {
  const { user, setupDummyUser } = useAuthStore();
  const { premiumTheme } = useUIStore();
  const colors = premiumTheme?.colors || COLORS;

  useEffect(() => {
    if (!user) {
      setupDummyUser();
    }
  }, [user]);

  useEffect(() => {
    if (user?.id === MockDataService.DUMMY_USER_ID) {
      MockDataService.seedDummyData();
    }
  }, [user]);
  const { habits, isLoading: habitsLoading, refetch: refetchHabits } = useHabits();
  const { completions, toggleCompletion } = useCompletions();
  const { todaySteps, liveSteps, isPedometerAvailable } = useSteps();
  const { checkForNewBadges } = useBadges();
  const { recentAchievements, focusSessions, isLoading: advancedLoading, refetch: refetchAdvanced } = useAdvancedFeatures();

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

  const handleRefresh = async () => {
    await Promise.all([refetchHabits(), refetchAdvanced()]);
  };

  const totalFocusMinutes = focusSessions.reduce((acc: number, s: any) => acc + s.duration, 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={habitsLoading || advancedLoading} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={() => (
          <View>
            {/* Header */}
            <LinearGradient
              colors={[colors.surface, colors.background]}
              style={styles.header}
            >
              <View>
                <Text style={[styles.greeting, { color: colors.textMuted }]}>{greeting},</Text>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.user_metadata?.name ?? 'there'} 👋</Text>
              </View>
            </LinearGradient>

            {/* Progress banner */}
            {totalCount > 0 && (
              <View style={styles.progressBanner}>
                <View style={styles.progressTextRow}>
                  <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                    {completedCount}/{totalCount} habits done
                  </Text>
                  {allDone && <Text style={[styles.allDone, { color: colors.success || COLORS.success }]}>All done! 🎉</Text>}
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.surface }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(completedCount / totalCount) * 100}%`,
                        backgroundColor: allDone ? (colors.success || COLORS.success) : colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Step ring */}
            <View style={[styles.stepSection, { backgroundColor: colors.card, borderColor: colors.cardBorder || COLORS.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Steps Today</Text>
              <StepProgressRing
                steps={liveSteps || todaySteps?.steps || 0}
                goal={stepGoal}
                size={160}
              />
              {!isPedometerAvailable && (
                <Text style={[styles.pedometerHint, { color: colors.textMuted }]}>Pedometer not available on this device</Text>
              )}
            </View>

            {/* Achievement Preview */}
            <AchievementPreview achievements={recentAchievements as any} />

            {/* Focus Highlights */}
            {totalFocusMinutes > 0 && (
              <FocusHighlights totalMinutes={totalFocusMinutes} sessionsCount={focusSessions.length} />
            )}

            <Text style={[styles.habitsTitle, { color: colors.textPrimary }]}>Today's Habits</Text>

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
              onPress={() => { }}
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
