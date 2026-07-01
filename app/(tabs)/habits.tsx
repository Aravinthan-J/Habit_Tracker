import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { useHabits } from '@/hooks/useHabits';
import { useCompletions } from '@/hooks/useCompletions';
import { HabitCard } from '@/components/habits/HabitCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { today, getLastNDays } from '@/utils/dateHelpers';
import { calculateCurrentStreak, calculateCurrentStreakWithFreezes } from '@/utils/streakCalculator';
import { inWeekCompletion, calculateWeeklyStreak, weeksCompletedInMonth } from '@/utils/frequency';
import { usePreferencesStore } from '@/store/preferencesStore';
import { getVacationDates } from '@/utils/vacation';
import { Habit } from '@/types/habit.types';
import { getUnscheduledDates } from '@/utils/scheduleHelpers';

type HabitFilter = 'all' | 'pending' | 'done';
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function HabitsScreen() {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const router = useRouter();
  const { habits, archivedHabits, isLoading, archiveHabit, unarchiveHabit, reorderHabits } = useHabits();
  const { completions, toggleCompletion } = useCompletions();
  const todayStr = today();
  const currentMonth = useMemo(() => todayStr.slice(0, 7), [todayStr]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<HabitFilter>('all');
  const [showArchived, setShowArchived] = useState(false);

  const weekDates = useMemo(() => getLastNDays(7).reverse(), []); // oldest → today
  const weekLabels = useMemo(
    () => weekDates.map((d) => {
      const [y, m, dd] = d.split('-').map(Number);
      return DOW[new Date(y, m - 1, dd).getDay()];
    }).join(''),
    [weekDates],
  );

  const activeHabitIds = useMemo(() => new Set(habits.map((h) => h.id)), [habits]);

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

  const completedTodayIds = useMemo(
    () => new Set(
      completions
        .filter((c) => c.date === todayStr && activeHabitIds.has(c.habit_id))
        .map((c) => c.habit_id)
    ),
    [completions, todayStr, activeHabitIds]
  );

  const vacationStart = usePreferencesStore((s) => s.vacationStart);
  const vacationEnd = usePreferencesStore((s) => s.vacationEnd);
  const vacationDates = useMemo(
    () => getVacationDates(vacationStart, vacationEnd),
    [vacationStart, vacationEnd],
  );

  // Frequency-aware "done": weekly habits count if done anytime this week.
  const doneHabitIds = useMemo(() => {
    const s = new Set<string>();
    for (const h of habits) {
      const done = h.frequency === 'weekly'
        ? inWeekCompletion(completionDatesByHabitId.get(h.id) ?? []) !== null
        : completedTodayIds.has(h.id);
      if (done) s.add(h.id);
    }
    return s;
  }, [habits, completionDatesByHabitId, completedTodayIds]);

  const doneToday = doneHabitIds.size;
  const totalHabits = habits.length;

  const visibleHabits = useMemo(() => {
    let list = habits;
    if (searchQuery) {
      list = list.filter((h) => h.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (filter === 'pending') list = list.filter((h) => !doneHabitIds.has(h.id));
    else if (filter === 'done') list = list.filter((h) => doneHabitIds.has(h.id));
    return list;
  }, [habits, searchQuery, filter, doneHabitIds]);

  const handleToggle = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (habit?.frequency === 'weekly') {
      const inWeek = inWeekCompletion(completionDatesByHabitId.get(habitId) ?? []);
      if (inWeek) {
        toggleCompletion.mutate({ habitId, date: inWeek, isCompleted: true });
      } else {
        toggleCompletion.mutate({ habitId, date: todayStr, isCompleted: false });
      }
      return;
    }
    const isCompleted = completedTodayIds.has(habitId);
    toggleCompletion.mutate({ habitId, date: todayStr, isCompleted });
  };

  const handleLongPress = (habit: Habit) => {
    Alert.alert(habit.title, 'What would you like to do?', [
      {
        text: 'Archive',
        onPress: () => Alert.alert('Archive habit?', `"${habit.title}" will be hidden from your lists. You can restore it anytime.`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Archive', style: 'destructive', onPress: () => archiveHabit.mutate(habit.id) },
        ]),
      },
      { text: 'Edit', onPress: () => router.push(`/habit/${habit.id}`) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleDragEnd = useCallback(({ data }: { data: Habit[] }) => {
    reorderHabits.mutate(data.map((h) => h.id));
  }, [reorderHabits]);

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={[COLORS.surface, COLORS.background] as const}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.title, { color: COLORS.textPrimary }]}>My Habits</Text>
            <Text style={[styles.count, { color: COLORS.textSecondary }]}>
              {habits.length} active{archivedHabits.length > 0 ? ` · ${archivedHabits.length} archived` : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/habit/new')}
            style={[styles.addBtn, { backgroundColor: COLORS.primary }]}
            accessibilityLabel="Create new habit"
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {habits.length > 5 && (
          <View style={[styles.searchContainer, { backgroundColor: COLORS.surface + '88', borderColor: COLORS.cardBorder }]}>
            <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
            <TextInput
              placeholder="Search habits..."
              placeholderTextColor={COLORS.textMuted}
              style={[styles.searchInput, { color: COLORS.textPrimary }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {totalHabits > 0 && (
          <>
            {/* Today summary */}
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryText, { color: COLORS.textSecondary }]}>
                {doneToday === totalHabits ? '🎉 All done today!' : `${doneToday}/${totalHabits} done today`}
              </Text>
            </View>
            <View style={[styles.summaryTrack, { backgroundColor: COLORS.surface }]}>
              <View
                style={[
                  styles.summaryFill,
                  {
                    width: `${(doneToday / totalHabits) * 100}%`,
                    backgroundColor: doneToday === totalHabits ? COLORS.success : COLORS.primary,
                  },
                ]}
              />
            </View>

            {/* Filter chips */}
            <View style={styles.chipsRow}>
              {(['all', 'pending', 'done'] as HabitFilter[]).map((f) => {
                const active = filter === f;
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFilter(f)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? COLORS.primary : COLORS.surface + '88',
                        borderColor: active ? COLORS.primary : COLORS.cardBorder,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? '#FFFFFF' : COLORS.textSecondary }]}>
                      {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Done'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
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
        <DraggableFlatList
          data={visibleHabits}
          keyExtractor={(item) => item.id}
          onDragEnd={handleDragEnd}
          renderItem={({ item, drag, isActive }: RenderItemParams<Habit>) => {
            const completionDates = completionDatesByHabitId.get(item.id) ?? [];
            const weekly = item.frequency === 'weekly';
            const monthlyCount = weekly
              ? weeksCompletedInMonth(completionDates, currentMonth)
              : (monthlyCountByHabitId.get(item.id) ?? 0);
            const dset = new Set(completionDates);
            const weekStatus = weekDates.map((d) => (dset.has(d) ? '1' : '0')).join('');
            const stackAfterTitle = item.stack_after
              ? habits.find((h) => h.id === item.stack_after)?.title
              : undefined;
            const itemBridge = weekly ? vacationDates : [...vacationDates, ...getUnscheduledDates(item.schedule_days, todayStr)];
            return (
              <ScaleDecorator activeScale={0.97}>
                <HabitCard
                  habit={item}
                  isCompleted={doneHabitIds.has(item.id)}
                  streak={weekly
                    ? calculateWeeklyStreak(completionDates)
                    : (itemBridge.length
                      ? calculateCurrentStreakWithFreezes(completionDates, itemBridge)
                      : calculateCurrentStreak(completionDates))}
                  onToggle={() => handleToggle(item.id)}
                  onPress={() => router.push(`/habit/${item.id}`)}
                  onLongPress={() => handleLongPress(item)}
                  drag={drag}
                  isActive={isActive}
                  monthlyCount={monthlyCount}
                  monthlyGoal={item.monthly_goal}
                  weekStatus={weekStatus}
                  weekLabels={weekLabels}
                  stackAfterTitle={stackAfterTitle}
                />
              </ScaleDecorator>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon={filter === 'done' ? 'checkmark-done-outline' : 'sparkles-outline'}
              title={filter === 'done' ? 'Nothing completed yet' : 'All caught up!'}
              subtitle={
                filter === 'done'
                  ? 'Complete a habit to see it here.'
                  : 'No habits match this filter right now.'
              }
            />
          }
          ListFooterComponent={
            <View style={{ paddingBottom: 20 }}>
              {archivedHabits.length > 0 && (
                <>
                  <TouchableOpacity
                    style={styles.archivedToggle}
                    onPress={() => setShowArchived((v) => !v)}
                  >
                    <Ionicons name={showArchived ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textMuted} />
                    <Text style={styles.archivedToggleText}>
                      {showArchived ? 'Hide' : 'Show'} archived ({archivedHabits.length})
                    </Text>
                  </TouchableOpacity>
                  {showArchived && archivedHabits.map((item) => (
                    <View key={item.id} style={[styles.archivedRow, { backgroundColor: COLORS.surface, borderColor: COLORS.cardBorder }]}>
                      <Text style={styles.archivedEmoji}>{item.icon ?? '📦'}</Text>
                      <Text style={[styles.archivedTitle, { color: COLORS.textSecondary }]} numberOfLines={1}>{item.title}</Text>
                      <TouchableOpacity
                        style={[styles.restoreBtn, { borderColor: COLORS.primary }]}
                        onPress={() => unarchiveHabit.mutate(item.id)}
                      >
                        <Text style={[styles.restoreText, { color: COLORS.primary }]}>Restore</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              )}
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
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
  summaryRow: { marginTop: SPACING.sm, marginBottom: SPACING.xs },
  summaryText: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.medium },
  summaryTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  summaryFill: { height: '100%', borderRadius: 3 },
  chipsRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  chipText: { fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.semibold },
  archivedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  archivedToggleText: { color: '#888', fontSize: TYPOGRAPHY.sm },
  archivedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    opacity: 0.7,
  },
  archivedEmoji: { fontSize: 20 },
  archivedTitle: { flex: 1, fontSize: TYPOGRAPHY.md },
  restoreBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  restoreText: { fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.semibold },
});
