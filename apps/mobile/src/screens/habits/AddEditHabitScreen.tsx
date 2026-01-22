/**
 * Add/Edit Habit Screen
 * Create new habit or edit existing one
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Input, Button } from '../../components/common';
import { ColorPicker } from '../../components/habit/ColorPicker';
import { IconPicker } from '../../components/habit/IconPicker';
import { useCreateHabit, useUpdateHabit, useHabit } from '../../hooks/useHabits';
import { LoadingSpinner } from '../../components/common';
import { colors, spacing, typography } from '../../constants/theme';

type RouteParams = {
  habitId?: string;
};

export function AddEditHabitScreen() {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation();
  const habitId = route.params?.habitId;
  const isEditing = !!habitId;

  // Fetch habit if editing
  const { data: existingHabit, isLoading: loadingHabit } = useHabit(habitId || '');

  // Form state
  const [title, setTitle] = useState('');
  const [monthlyGoal, setMonthlyGoal] = useState('20');
  const [color, setColor] = useState('#6C63FF');
  const [icon, setIcon] = useState('💪');
  const [touched, setTouched] = useState({
    title: false,
    monthlyGoal: false,
  });

  // Mutations
  const { mutateAsync: createHabit, isPending: creating } = useCreateHabit();
  const { mutateAsync: updateHabit, isPending: updating } = useUpdateHabit();

  // Populate form if editing
  useEffect(() => {
    if (existingHabit) {
      setTitle(existingHabit.title);
      setMonthlyGoal(String(existingHabit.monthlyGoal));
      setColor(existingHabit.color);
      setIcon(existingHabit.icon);
    }
  }, [existingHabit]);

  // Validation
  const errors = {
    title: title.trim().length < 1 ? 'Title is required' : '',
    monthlyGoal:
      !monthlyGoal || isNaN(Number(monthlyGoal)) || Number(monthlyGoal) < 1 || Number(monthlyGoal) > 31
        ? 'Goal must be between 1 and 31'
        : '',
  };

  const isValid = !errors.title && !errors.monthlyGoal && title && monthlyGoal;

  const handleSave = async () => {
    if (!isValid) {
      setTouched({ title: true, monthlyGoal: true });
      return;
    }

    try {
      const habitData = {
        title: title.trim(),
        monthlyGoal: Number(monthlyGoal),
        color,
        icon,
      };

      if (isEditing && habitId) {
        await updateHabit({ habitId, data: habitData });
        Alert.alert('Success', 'Habit updated successfully!');
      } else {
        await createHabit(habitData);
        Alert.alert('Success', 'Habit created successfully!');
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || `Failed to ${isEditing ? 'update' : 'create'} habit`);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (loadingHabit && isEditing) {
    return <LoadingSpinner fullScreen message="Loading habit..." />;
  }

  const isSaving = creating || updating;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Input */}
        <Input
          label="Habit Name"
          placeholder="e.g., Morning Workout"
          value={title}
          onChangeText={setTitle}
          onBlur={() => setTouched({ ...touched, title: true })}
          error={errors.title}
          touched={touched.title}
          maxLength={100}
        />

        {/* Monthly Goal Input */}
        <Input
          label="Monthly Goal (days)"
          placeholder="20"
          value={monthlyGoal}
          onChangeText={setMonthlyGoal}
          onBlur={() => setTouched({ ...touched, monthlyGoal: true })}
          error={errors.monthlyGoal}
          touched={touched.monthlyGoal}
          keyboardType="number-pad"
          maxLength={2}
        />

        <Text style={styles.helperText}>
          How many days per month do you want to complete this habit?
        </Text>

        {/* Color Picker */}
        <ColorPicker selectedColor={color} onColorSelect={setColor} />

        {/* Icon Picker */}
        <IconPicker selectedIcon={icon} onIconSelect={setIcon} />

        {/* Preview */}
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Preview</Text>
          <View style={styles.previewCard}>
            <View style={[styles.previewColor, { backgroundColor: color }]} />
            <Text style={styles.previewText}>
              {icon} {title || 'Your Habit Name'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title={isEditing ? 'Update Habit' : 'Create Habit'}
            onPress={handleSave}
            loading={isSaving}
            disabled={!isValid || isSaving}
            fullWidth
            style={styles.saveButton}
          />
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            fullWidth
            disabled={isSaving}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  helperText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  preview: {
    marginBottom: spacing.xl,
  },
  previewLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewColor: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  previewText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  actions: {
    gap: spacing.md,
  },
  saveButton: {
    marginBottom: spacing.sm,
  },
});
