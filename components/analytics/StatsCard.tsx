import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore } from '@/store/uiStore';

interface StatsCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  color?: string;
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  value,
  label,
  color = COLORS.primary,
  subtitle,
}) => {
  const { premiumTheme } = useUIStore();
  const themeColors = premiumTheme?.colors || COLORS;

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: themeColors.surface + '66', // Glass effect
        borderColor: color + '44',
      }
    ]}>
      <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.value, { color: themeColors.textPrimary }]}>{value}</Text>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>{label}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: themeColors.textMuted }]}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1.5,
    margin: SPACING.xs,
    ...SHADOWS.small,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  content: {
    alignItems: 'center',
  },
  value: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.bold,
  },
  label: {
    fontSize: TYPOGRAPHY.xs,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: TYPOGRAPHY.medium,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
});
