/**
 * Themed Styles Hook
 * Helper hook to create theme-aware styles
 */

import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Create theme-aware styles
 * Usage: const styles = useThemedStyles((colors) => ({ container: { backgroundColor: colors.background } }))
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  createStyles: (colors: ReturnType<typeof useTheme>['colors']) => T
): T {
  const { colors } = useTheme();

  return useMemo(() => StyleSheet.create(createStyles(colors)), [colors, createStyles]);
}
