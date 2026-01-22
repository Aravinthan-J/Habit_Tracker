/**
 * Icon Picker Component
 * Select an emoji icon for the habit
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

interface IconPickerProps {
  selectedIcon: string;
  onIconSelect: (icon: string) => void;
}

const HABIT_ICONS = [
  '💪', '🏃', '🧘', '📚', '✍️', '💻',
  '🎯', '🎨', '🎵', '🎸', '📖', '🧠',
  '💼', '☕', '💧', '🥗', '🛌', '🌅',
  '🚴', '🏊', '⚡', '🔥', '✨', '🌟',
  '📝', '📱', '🎮', '🎬', '📷', '🌱',
];

export function IconPicker({ selectedIcon, onIconSelect }: IconPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Icon</Text>
      <View style={styles.iconGrid}>
        {HABIT_ICONS.map((icon) => (
          <TouchableOpacity
            key={icon}
            style={[
              styles.iconOption,
              selectedIcon === icon && styles.iconOptionSelected,
            ]}
            onPress={() => onIconSelect(icon)}
          >
            <Text style={styles.iconText}>{icon}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
  },
  iconOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    borderWidth: 3,
  },
  iconText: {
    fontSize: 28,
  },
});
