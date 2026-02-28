import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart as RNBarChart } from 'react-native-chart-kit';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface BarChartProps {
  data: { labels: string[]; datasets: Array<{ data: number[] }> };
  title?: string;
  color?: string;
  suffix?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  color = COLORS.primary,
  suffix = '',
}) => {
  return (
    <View style={[styles.container, { backgroundColor: COLORS.surface + '44', borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.cardBorder }]}>
      {title && <Text style={[styles.title, { color: COLORS.textPrimary }]}>{title}</Text>}
      <RNBarChart
        data={data}
        width={width - SPACING.lg * 2 - SPACING.xl * 2 - SPACING.md * 2}
        height={180}
        yAxisLabel=""
        yAxisSuffix={suffix}
        chartConfig={{
          backgroundColor: 'transparent',
          backgroundGradientFrom: 'transparent',
          backgroundGradientTo: 'transparent',
          decimalPlaces: 0,
          color: (opacity = 1) => color,
          labelColor: () => COLORS.textMuted,
          barPercentage: 0.6,
          propsForBackgroundLines: {
            strokeDasharray: '',
            strokeWidth: '0.5',
            stroke: COLORS.textMuted + '22',
          },
        }}
        style={{ borderRadius: RADIUS.md, marginHorizontal: -SPACING.xs }}
        withInnerLines={true}
        showValuesOnTopOfBars
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  title: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    marginBottom: SPACING.sm,
  },
});
