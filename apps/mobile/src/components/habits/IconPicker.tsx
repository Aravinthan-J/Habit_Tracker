import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

interface IconPickerProps {
  selectedIcon: string;
  onIconSelect: (icon: string) => void;
  label?: string;
}

const HABIT_ICONS = [
  '💪', '🏃', '🧘', '🏋️', '🚴', '🏊', '⚽', '🎾',
  '📚', '✍️', '🎨', '🎸', '🎹', '🎤', '📖', '✏️',
  '💧', '🥗', '🍎', '🥤', '☕', '🍵', '🥛', '🍇',
  '😴', '🛏️', '⏰', '🌙', '☀️', '🌟', '✨', '🔥',
  '🎯', '💼', '💻', '📱', '📧', '📞', '📝', '📅',
  '🏠', '🧹', '🛒', '💰', '💳', '🎁', '🎉', '🎊',
  '🌱', '🌳', '🌻', '🌸', '🌺', '🍀', '🌿', '🌾',
  '❤️', '🧠', '🦷', '👁️', '👂', '🫁', '🫀', '💊',
];

const IconPicker: React.FC<IconPickerProps> = ({
  selectedIcon,
  onIconSelect,
  label = 'Icon',
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.iconGrid}>
        {HABIT_ICONS.map((icon) => {
          const isSelected = selectedIcon === icon;
          return (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconButton,
                isSelected && styles.selectedIcon,
              ]}
              onPress={() => onIconSelect(icon)}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>{icon}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundDark,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIcon: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  icon: {
    fontSize: 24,
  },
});

export default IconPicker;
