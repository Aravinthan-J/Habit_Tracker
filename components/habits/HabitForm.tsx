import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { validateHabitTitle, validateMonthlyGoal } from '@/utils/validators';
import { Habit, HabitFrequency } from '@/types/habit.types';
import { useHabits } from '@/hooks/useHabits';
import { resolveIcon } from '@/utils/iconHelpers';
import { DAY_LABELS } from '@/utils/scheduleHelpers';

const HABIT_ICONS = ['✨', '💪', '📚', '🏃', '🧘', '🥗', '💧', '🎯', '🏋️', '🎨', '🎵', '🌿', '😴', '🚴', '🧠'];
const GOAL_PRESETS = [10, 15, 20, 25, 30];
const WEEKLY_GOAL_PRESETS = [1, 2, 3, 4];
const DEFAULT_DAILY_GOAL = 20;
const DEFAULT_WEEKLY_GOAL = 4;

interface HabitFormProps {
  initialValues?: Partial<Habit>;
  onSubmit: (values: {
    title: string;
    monthly_goal: number;
    color: string;
    icon: string;
    frequency: HabitFrequency;
    smart_reminder: boolean;
    stack_after: string | null;
    schedule_days: number[] | null;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export const HabitForm: React.FC<HabitFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Create Habit',
}) => {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [frequency, setFrequency] = useState<HabitFrequency>(initialValues?.frequency ?? 'daily');
  const [monthlyGoal, setMonthlyGoal] = useState(
    String(initialValues?.monthly_goal ?? (initialValues?.frequency === 'weekly' ? DEFAULT_WEEKLY_GOAL : DEFAULT_DAILY_GOAL)),
  );
  const [color, setColor] = useState(initialValues?.color ?? COLORS.habitColors[0]);
  const [icon, setIcon] = useState(initialValues?.icon ?? '✨');
  const [smartReminder, setSmartReminder] = useState(initialValues?.smart_reminder ?? false);
  const [stackAfter, setStackAfter] = useState<string | null>(initialValues?.stack_after ?? null);
  // null = every day; array = specific days (0=Sun…6=Sat)
  const [scheduleDays, setScheduleDays] = useState<number[] | null>(initialValues?.schedule_days ?? null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [goalError, setGoalError] = useState<string | null>(null);

  const { habits } = useHabits();

  // Habits this one can be stacked after: not itself, and not anything whose
  // chain already leads back here (would create a cycle).
  const stackCandidates = habits.filter((h) => {
    if (h.id === initialValues?.id) return false;
    if (!initialValues?.id) return true;
    let cursor: Habit | undefined = h;
    for (let depth = 0; cursor && depth < habits.length; depth++) {
      if (cursor.stack_after === initialValues.id) return false;
      cursor = habits.find((x) => x.id === cursor!.stack_after);
    }
    return true;
  });

  const colorPalette = COLORS.habitColors;
  const isWeekly = frequency === 'weekly';
  const goalPresets = isWeekly ? WEEKLY_GOAL_PRESETS : GOAL_PRESETS;
  const goalUnit = isWeekly ? 'weeks' : 'days';

  const changeFrequency = (next: HabitFrequency) => {
    if (next === frequency) return;
    setFrequency(next);
    // Reset the goal to a sensible default for the new cadence.
    setMonthlyGoal(String(next === 'weekly' ? DEFAULT_WEEKLY_GOAL : DEFAULT_DAILY_GOAL));
    setGoalError(null);
  };

  const handleSubmit = () => {
    const titleErr = validateHabitTitle(title);
    const goalErr = validateMonthlyGoal(Number(monthlyGoal));
    setTitleError(titleErr);
    setGoalError(goalErr);
    if (titleErr || goalErr) return;

    onSubmit({
      title: title.trim(),
      monthly_goal: Number(monthlyGoal),
      color,
      icon,
      frequency,
      smart_reminder: smartReminder,
      stack_after: stackAfter,
      schedule_days: isWeekly ? null : scheduleDays,
    });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {/* Live preview */}
      <LinearGradient
        colors={[color + '33', COLORS.surface + '00'] as const}
        style={[styles.preview, { borderColor: color + '40' }]}
      >
        <LinearGradient
          colors={[color, color + 'AA'] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.previewIcon, SHADOWS.medium]}
        >
          <Text style={styles.previewEmoji}>{icon}</Text>
        </LinearGradient>
        <Text style={[styles.previewTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>
          {title.trim() || 'Your new habit'}
        </Text>
        <View style={[styles.previewGoalPill, { backgroundColor: color + '22' }]}>
          <Ionicons name={isWeekly ? 'repeat-outline' : 'calendar-outline'} size={12} color={color} />
          <Text style={[styles.previewGoalText, { color }]}>
            {isWeekly ? `Weekly · ${monthlyGoal || 0} weeks / month` : `${monthlyGoal || 0} days / month`}
          </Text>
        </View>
      </LinearGradient>

      <Input
        label="Habit Title"
        placeholder="e.g., Morning meditation"
        value={title}
        onChangeText={setTitle}
        error={titleError}
        leftIcon="pencil-outline"
        maxLength={100}
        accessibilityLabel="Habit title input"
      />

      {/* Icon Picker */}
      <Text style={styles.sectionLabel}>Pick an Icon</Text>
      <View style={styles.iconGrid}>
        {HABIT_ICONS.map((emoji) => {
          const selected = icon === emoji;
          return (
            <TouchableOpacity
              key={emoji}
              onPress={() => setIcon(emoji)}
              style={[
                styles.iconOption,
                { backgroundColor: selected ? color + '26' : COLORS.surface },
                selected && { borderColor: color, borderWidth: 2.5 },
              ]}
              accessibilityLabel={`Icon ${emoji}`}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Color Picker */}
      <Text style={styles.sectionLabel}>Choose a Color</Text>
      <View style={styles.colorRow}>
        {colorPalette.map((c) => {
          const selected = color === c;
          return (
            <TouchableOpacity
              key={c}
              onPress={() => setColor(c)}
              style={[styles.colorDot, { backgroundColor: c }, selected && styles.colorSelected]}
              accessibilityLabel={`Color ${c}`}
            >
              {selected && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Frequency */}
      <Text style={styles.sectionLabel}>Frequency</Text>
      <View style={styles.freqRow}>
        {([
          { key: 'daily' as const, label: 'Daily', icon: 'sunny-outline' as const, sub: 'Every day' },
          { key: 'weekly' as const, label: 'Weekly', icon: 'repeat-outline' as const, sub: 'Once a week' },
        ]).map((opt) => {
          const selected = frequency === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => changeFrequency(opt.key)}
              style={[
                styles.freqChip,
                {
                  backgroundColor: selected ? color + '1F' : COLORS.surface,
                  borderColor: selected ? color : COLORS.cardBorder,
                },
              ]}
              accessibilityLabel={`Frequency ${opt.label}`}
            >
              <Ionicons name={opt.icon} size={18} color={selected ? color : COLORS.textMuted} />
              <Text style={[styles.freqLabel, { color: selected ? COLORS.textPrimary : COLORS.textSecondary }]}>{opt.label}</Text>
              <Text style={[styles.freqSub, { color: COLORS.textMuted }]}>{opt.sub}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Schedule days — only for daily habits */}
      {!isWeekly && (
        <>
          <Text style={styles.sectionLabel}>Repeat On</Text>
          <View style={styles.dayRow}>
            {DAY_LABELS.map((label, dow) => {
              const allDays = !scheduleDays || scheduleDays.length === 0;
              const active = allDays || scheduleDays!.includes(dow);
              const toggleDay = () => {
                if (allDays) {
                  // switch from "every day" to "every day except this one"
                  const next = [0, 1, 2, 3, 4, 5, 6].filter((d) => d !== dow);
                  setScheduleDays(next);
                } else {
                  const next = active
                    ? scheduleDays!.filter((d) => d !== dow)
                    : [...scheduleDays!, dow].sort();
                  setScheduleDays(next.length === 7 || next.length === 0 ? null : next);
                }
              };
              return (
                <TouchableOpacity
                  key={dow}
                  onPress={toggleDay}
                  style={[
                    styles.dayChip,
                    { backgroundColor: active ? color : COLORS.surface, borderColor: active ? color : COLORS.cardBorder },
                  ]}
                  accessibilityLabel={`${label} ${active ? 'selected' : 'not selected'}`}
                >
                  <Text style={[styles.dayChipText, { color: active ? '#fff' : COLORS.textMuted }]}>
                    {label.charAt(0)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {scheduleDays && scheduleDays.length > 0 && scheduleDays.length < 7 && (
            <Text style={[styles.settingHint, { marginBottom: SPACING.md }]}>
              {scheduleDays.map((d) => DAY_LABELS[d]).join(', ')}
            </Text>
          )}
        </>
      )}

      {/* Monthly goal quick picks */}
      <Text style={styles.sectionLabel}>{isWeekly ? 'Monthly Goal (weeks)' : 'Monthly Goal'}</Text>
      <View style={styles.goalRow}>
        {goalPresets.map((g) => {
          const selected = Number(monthlyGoal) === g;
          return (
            <TouchableOpacity
              key={g}
              onPress={() => { setMonthlyGoal(String(g)); setGoalError(null); }}
              style={[
                styles.goalChip,
                {
                  backgroundColor: selected ? color : COLORS.surface,
                  borderColor: selected ? color : COLORS.cardBorder,
                },
              ]}
            >
              <Text style={[styles.goalChipText, { color: selected ? '#FFFFFF' : COLORS.textSecondary }]}>{g}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Input
        placeholder={`Custom (${goalUnit})`}
        value={monthlyGoal}
        onChangeText={setMonthlyGoal}
        error={goalError}
        keyboardType="numeric"
        leftIcon={isWeekly ? 'repeat-outline' : 'calendar-outline'}
        hint={isWeekly
          ? 'How many weeks per month do you want to complete this habit?'
          : 'How many days per month do you want to complete this habit?'}
      />

      {/* Smart reminder */}
      <Text style={styles.sectionLabel}>Reminders</Text>
      <View style={[styles.settingCard, { borderColor: COLORS.cardBorder }]}>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>Smart reminder</Text>
          <Text style={styles.settingHint}>
            Learns when you usually complete this habit and reminds you around that time — skipped once you're done for the day.
          </Text>
        </View>
        <Switch
          value={smartReminder}
          onValueChange={setSmartReminder}
          trackColor={{ false: COLORS.surfaceLight, true: color }}
          thumbColor="#FFFFFF"
          accessibilityLabel="Toggle smart reminder"
        />
      </View>

      {/* Habit stacking */}
      {stackCandidates.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Stack After (optional)</Text>
          <Text style={styles.settingHint}>
            Chain this habit to another — you'll get a nudge to do it right after.
          </Text>
          <View style={styles.stackList}>
            <TouchableOpacity
              onPress={() => setStackAfter(null)}
              style={[
                styles.stackChip,
                {
                  backgroundColor: stackAfter === null ? color : COLORS.surface,
                  borderColor: stackAfter === null ? color : COLORS.cardBorder,
                },
              ]}
            >
              <Text style={[styles.stackChipText, { color: stackAfter === null ? '#FFFFFF' : COLORS.textSecondary }]}>
                None
              </Text>
            </TouchableOpacity>
            {stackCandidates.map((h) => {
              const selected = stackAfter === h.id;
              return (
                <TouchableOpacity
                  key={h.id}
                  onPress={() => setStackAfter(selected ? null : h.id)}
                  style={[
                    styles.stackChip,
                    {
                      backgroundColor: selected ? color : COLORS.surface,
                      borderColor: selected ? color : COLORS.cardBorder,
                    },
                  ]}
                  accessibilityLabel={`Stack after ${h.title}`}
                >
                  <Text style={styles.stackChipEmoji}>{resolveIcon(h.icon)}</Text>
                  <Text
                    style={[styles.stackChipText, { color: selected ? '#FFFFFF' : COLORS.textSecondary }]}
                    numberOfLines={1}
                  >
                    {h.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      <View style={styles.actions}>
        <Button title="Cancel" onPress={onCancel} variant="ghost" style={styles.cancelBtn} />
        <Button
          title={submitLabel}
          onPress={handleSubmit}
          loading={isLoading}
          style={styles.submitBtn}
        />
      </View>
    </ScrollView>
  );
};

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
  container: { flex: 1 },
  preview: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.xl,
  },
  previewIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  previewEmoji: { fontSize: 36 },
  previewTitle: { fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold, maxWidth: '90%' },
  previewGoalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.sm,
  },
  previewGoalText: { fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.semibold },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
    letterSpacing: 0.3,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emoji: { fontSize: 24 },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  colorDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: COLORS.textPrimary,
  },
  dayRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  dayChip: {
    flex: 1,
    height: 38,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipText: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.bold },
  freqRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  freqChip: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 2,
  },
  freqLabel: { fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold, marginTop: 2 },
  freqSub: { fontSize: TYPOGRAPHY.xs },
  goalRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  goalChip: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  goalChipText: { fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.bold },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  settingText: { flex: 1 },
  settingTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    marginBottom: 2,
  },
  settingHint: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.xs,
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  stackList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  stackChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    maxWidth: '100%',
  },
  stackChipEmoji: { fontSize: 14 },
  stackChipText: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold, flexShrink: 1 },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxxl,
  },
  cancelBtn: { flex: 1 },
  submitBtn: { flex: 2 },
});
