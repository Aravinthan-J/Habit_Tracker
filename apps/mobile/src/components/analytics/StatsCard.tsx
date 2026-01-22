/**
 * Stats Card Component
 * Displays a single statistic with icon
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  subtitle?: string;
  color?: string;
}

export function StatsCard({ title, value, icon, subtitle, color = colors.primary }: StatsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
    marginBottom: spacing.md,
  },
  content: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: typography.fontSize.xl,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  value: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },
});
