import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';

interface InsightCardProps {
  insight: string;
  type?: 'positive' | 'warning' | 'info';
}

export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  type = 'info',
}) => {
  const config = {
    positive: { icon: 'trending-up' as const, color: COLORS.success, bg: COLORS.success + '22' },
    warning: { icon: 'warning-outline' as const, color: COLORS.warning, bg: COLORS.warning + '22' },
    info: { icon: 'bulb-outline' as const, color: COLORS.primary, bg: COLORS.primary + '22' },
  }[type];

  return (
    <View style={[styles.card, { backgroundColor: config.bg, borderColor: config.color + '44' }]}>
      <Ionicons name={config.icon} size={18} color={config.color} style={styles.icon} />
      <Text style={[styles.text, { color: config.color }]}>{insight}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  icon: { marginRight: SPACING.sm, marginTop: 1 },
  text: { flex: 1, fontSize: TYPOGRAPHY.sm, lineHeight: 20 },
});
