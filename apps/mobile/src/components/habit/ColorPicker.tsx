/**
 * Color Picker Component
 * Select a color for the habit
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const HABIT_COLORS = [
  '#6C63FF', // Purple
  '#48BB78', // Green
  '#F56565', // Red
  '#4299E1', // Blue
  '#ED8936', // Orange
  '#9F7AEA', // Violet
  '#38B2AC', // Teal
  '#ED64A6', // Pink
  '#ECC94B', // Yellow
  '#A0AEC0', // Gray
  '#319795', // Cyan
  '#E53E3E', // Dark Red
];

export function ColorPicker({ selectedColor, onColorSelect }: ColorPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Color</Text>
      <View style={styles.colorGrid}>
        {HABIT_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              selectedColor === color && styles.colorOptionSelected,
            ]}
            onPress={() => onColorSelect(color)}
          >
            {selectedColor === color && (
              <Text style={styles.checkmark}>✓</Text>
            )}
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
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.text,
    borderWidth: 3,
  },
  checkmark: {
    color: colors.white,
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
  },
});
