import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';
import { useHabits } from '../../hooks/useHabits';
import { Input, Button } from '../../components/common';
import ColorPicker from '../../components/habits/ColorPicker';
import IconPicker from '../../components/habits/IconPicker';
import { validateHabitTitle } from '@habit-tracker/shared-utils';

/**
 * Add Habit Screen - Create new habit
 */
const AddHabitScreen = ({ navigation, route }: any) => {
  const { createHabit, isCreating } = useHabits();
  const habitToEdit = route?.params?.habit; // For future edit functionality
  const isEditing = !!habitToEdit;

  // Form state
  const [title, setTitle] = useState(habitToEdit?.title || '');
  const [monthlyGoal, setMonthlyGoal] = useState(habitToEdit?.monthlyGoal?.toString() || '20');
  const [color, setColor] = useState(habitToEdit?.color || '#6366F1');
  const [icon, setIcon] = useState(habitToEdit?.icon || '💪');

  // Validation
  const [titleTouched, setTitleTouched] = useState(false);
  const [goalTouched, setGoalTouched] = useState(false);

  const titleError =
    titleTouched && !validateHabitTitle(title) ? 'Title must be 1-100 characters' : '';
  const goalValue = parseInt(monthlyGoal);
  const goalError =
    goalTouched && (isNaN(goalValue) || goalValue < 1 || goalValue > 31)
      ? 'Goal must be between 1 and 31'
      : '';

  const isFormValid = validateHabitTitle(title) && goalValue >= 1 && goalValue <= 31;

  const handleSave = () => {
    setTitleTouched(true);
    setGoalTouched(true);

    if (!isFormValid) {
      return;
    }

    const habitData = {
      title: title.trim(),
      monthlyGoal: goalValue,
      color,
      icon,
      notificationsEnabled: false,
    };

    createHabit(habitData, {
      onSuccess: () => {
        Alert.alert('Success', 'Habit created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      },
      onError: (error: any) => {
        Alert.alert(
          'Error',
          error?.response?.data?.message || 'Failed to create habit. Please try again.'
        );
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>{isEditing ? 'Edit Habit' : 'Create New Habit'}</Text>
            <Text style={styles.subtitle}>Build a habit that sticks!</Text>
          </View>

          <View style={styles.form}>
            {/* Title Input */}
            <Input
              label="Habit Title *"
              placeholder="e.g., Morning Workout"
              value={title}
              onChangeText={setTitle}
              onBlur={() => setTitleTouched(true)}
              error={titleError}
              touched={titleTouched}
              maxLength={100}
              icon="create-outline"
            />

            {/* Monthly Goal Input */}
            <Input
              label="Monthly Goal (days) *"
              placeholder="20"
              value={monthlyGoal}
              onChangeText={setMonthlyGoal}
              onBlur={() => setGoalTouched(true)}
              error={goalError}
              touched={goalTouched}
              keyboardType="number-pad"
              maxLength={2}
              icon="calendar-outline"
            />

            <Text style={styles.helperText}>
              How many days per month do you want to complete this habit?
            </Text>

            {/* Color Picker */}
            <ColorPicker selectedColor={color} onColorSelect={setColor} label="Choose Color" />

            {/* Icon Picker */}
            <IconPicker selectedIcon={icon} onIconSelect={setIcon} label="Choose Icon" />

            {/* Preview Card */}
            <View style={styles.preview}>
              <Text style={styles.previewLabel}>Preview:</Text>
              <View style={[styles.previewCard, { borderLeftColor: color }]}>
                <View style={[styles.previewIcon, { backgroundColor: color + '20' }]}>
                  <Text style={styles.previewIconText}>{icon}</Text>
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewTitle}>{title || 'Habit Title'}</Text>
                  <Text style={styles.previewGoal}>
                    Goal: {monthlyGoal || '20'} days/month
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <Button
              title={isEditing ? 'Save Changes' : 'Create Habit'}
              onPress={handleSave}
              loading={isCreating}
              disabled={!isFormValid || isCreating}
              fullWidth
              style={styles.saveButton}
            />

            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  form: {
    flex: 1,
  },
  helperText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
    marginLeft: spacing.xs,
  },
  preview: {
    marginVertical: spacing.lg,
  },
  previewLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: spacing.sm,
    borderLeftWidth: 4,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  previewIconText: {
    fontSize: 24,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  previewGoal: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  saveButton: {
    marginBottom: spacing.md,
  },
});

export default AddHabitScreen;
