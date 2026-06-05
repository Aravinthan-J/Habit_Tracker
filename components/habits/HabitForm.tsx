import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { validateHabitTitle, validateMonthlyGoal } from '@/utils/validators';
import { Habit } from '@/types/habit.types';

const HABIT_ICONS = ['✨', '💪', '📚', '🏃', '🧘', '🥗', '💧', '🎯', '🏋️', '🎨', '🎵', '🌿', '😴', '🚴', '🧠'];
const GOAL_PRESETS = [10, 15, 20, 25, 30];

interface HabitFormProps {
  initialValues?: Partial<Habit>;
  onSubmit: (values: { title: string; monthly_goal: number; color: string; icon: string }) => void;
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
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [monthlyGoal, setMonthlyGoal] = useState(String(initialValues?.monthly_goal ?? 20));
  const [color, setColor] = useState(initialValues?.color ?? COLORS.habitColors[0]);
  const [icon, setIcon] = useState(initialValues?.icon ?? '✨');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [goalError, setGoalError] = useState<string | null>(null);

  const colorPalette = COLORS.habitColors;

  const handleSubmit = () => {
    const titleErr = validateHabitTitle(title);
    const goalErr = validateMonthlyGoal(Number(monthlyGoal));
    setTitleError(titleErr);
    setGoalError(goalErr);
    if (titleErr || goalErr) return;

    onSubmit({ title: title.trim(), monthly_goal: Number(monthlyGoal), color, icon });
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
          <Ionicons name="calendar-outline" size={12} color={color} />
          <Text style={[styles.previewGoalText, { color }]}>{monthlyGoal || 0} days / month</Text>
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

      {/* Monthly goal quick picks */}
      <Text style={styles.sectionLabel}>Monthly Goal</Text>
      <View style={styles.goalRow}>
        {GOAL_PRESETS.map((g) => {
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
        placeholder="Custom (days)"
        value={monthlyGoal}
        onChangeText={setMonthlyGoal}
        error={goalError}
        keyboardType="numeric"
        leftIcon="calendar-outline"
        hint="How many days per month do you want to complete this habit?"
      />

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

const styles = StyleSheet.create({
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
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxxl,
  },
  cancelBtn: { flex: 1 },
  submitBtn: { flex: 2 },
});
