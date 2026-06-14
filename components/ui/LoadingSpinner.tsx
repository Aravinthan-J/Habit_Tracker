import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
}) => {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  return (
  <View style={styles.container}>
    <ActivityIndicator size={size} color={color ?? COLORS.primary} />
  </View>
  );
};

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
