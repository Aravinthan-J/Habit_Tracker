/**
 * Theme Constants
 * Design system tokens for colors, spacing, typography, etc.
 */

export const lightColors = {
  // Primary colors
  primary: '#6C63FF',
  primaryDark: '#5548CC',
  primaryLight: '#8C85FF',

  // Secondary colors
  secondary: '#48BB78',
  secondaryDark: '#38A169',
  secondaryLight: '#68D391',

  // Status colors
  success: '#48BB78',
  error: '#F56565',
  warning: '#ED8936',
  info: '#4299E1',

  // Neutral colors
  text: '#1A202C',
  textSecondary: '#718096',
  textLight: '#A0AEC0',

  background: '#F7FAFC',
  backgroundDark: '#EDF2F7',
  white: '#FFFFFF',
  black: '#000000',

  border: '#E2E8F0',
  borderLight: '#F7FAFC',

  // Habit colors (for color picker)
  habitColors: [
    '#6C63FF', // Indigo
    '#48BB78', // Green
    '#F56565', // Red
    '#ED8936', // Orange
    '#4299E1', // Blue
    '#9F7AEA', // Purple
    '#38B2AC', // Teal
    '#EC4899', // Pink
    '#ECC94B', // Yellow
    '#A0AEC0', // Gray
    '#F687B3', // Light Pink
    '#4FD1C5', // Cyan
    '#FC8181', // Light Red
    '#B794F4', // Light Purple
    '#63B3ED', // Light Blue
    '#F6AD55', // Light Orange
  ],
};

export const darkColors = {
  // Primary colors
  primary: '#8C85FF',
  primaryDark: '#6C63FF',
  primaryLight: '#A39FFF',

  // Secondary colors
  secondary: '#68D391',
  secondaryDark: '#48BB78',
  secondaryLight: '#84E1A8',

  // Status colors
  success: '#68D391',
  error: '#FC8181',
  warning: '#F6AD55',
  info: '#63B3ED',

  // Neutral colors
  text: '#F7FAFC',
  textSecondary: '#CBD5E0',
  textLight: '#A0AEC0',

  background: '#1A202C',
  backgroundDark: '#0F1419',
  white: '#2D3748',
  black: '#000000',

  border: '#2D3748',
  borderLight: '#1A202C',

  // Habit colors (for color picker) - same as light
  habitColors: [
    '#6C63FF', // Indigo
    '#48BB78', // Green
    '#F56565', // Red
    '#ED8936', // Orange
    '#4299E1', // Blue
    '#9F7AEA', // Purple
    '#38B2AC', // Teal
    '#EC4899', // Pink
    '#ECC94B', // Yellow
    '#A0AEC0', // Gray
    '#F687B3', // Light Pink
    '#4FD1C5', // Cyan
    '#FC8181', // Light Red
    '#B794F4', // Light Purple
    '#63B3ED', // Light Blue
    '#F6AD55', // Light Orange
  ],
};

// Default to light colors for backward compatibility
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const icons = {
  // Emoji icons for habits
  habitIcons: [
    '💪', '📚', '🧘', '☕', '💧', '🏃', '🎯', '✍️',
    '🎨', '🎵', '🎮', '🍎', '🥗', '🛌', '🌅', '🌙',
    '💻', '📱', '🎓', '💼', '🏋️', '🚴', '🏊', '⚽',
    '🎸', '📷', '🎬', '🎭', '🌱', '🌳', '🌻', '🌈',
  ],
};
