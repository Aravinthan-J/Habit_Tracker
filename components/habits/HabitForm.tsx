import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { validateHabitTitle, validateMonthlyGoal } from '@/utils/validators';
import { Habit } from '@/types/habit.types';

const HABIT_ICONS = ['✨', '💪', '📚', '🏃', '🧘', '🥗', '💧', '🎯', '🏋️', '🎨', '🎵', '🌿', '😴', '🚴', '🧠'];

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
        {HABIT_ICONS.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            onPress={() => setIcon(emoji)}
            style={[styles.iconOption, icon === emoji && { borderColor: color, borderWidth: 2.5 }]}
            accessibilityLabel={`Icon ${emoji}`}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Color Picker */}
      <Text style={styles.sectionLabel}>Choose a Color</Text>
      <View style={styles.colorRow}>
        {colorPalette.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setColor(c)}
            style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorSelected]}
            accessibilityLabel={`Color ${c}`}
          />
        ))}
      </View>

      <Input
        label="Monthly Goal (days)"
        placeholder="20"
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
    backgroundColor: COLORS.surface,
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
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: COLORS.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxxl,
  },
  cancelBtn: { flex: 1 },
  submitBtn: { flex: 2 },
});
