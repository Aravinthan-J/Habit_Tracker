import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { RADIUS, SPACING, SHADOWS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = SPACING.lg,
}) => {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const variantStyle = {
    default: { backgroundColor: COLORS.card },
    elevated: { backgroundColor: COLORS.card, ...SHADOWS.medium },
    bordered: {
      backgroundColor: COLORS.card,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
  }[variant];

  return (
    <View style={[styles.base, variantStyle, { padding }, style]}>
      {children}
    </View>
  );
};

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
  base: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
});
