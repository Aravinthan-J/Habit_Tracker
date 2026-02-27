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
}) => (
  <View style={styles.container}>
    {title && <Text style={styles.title}>{title}</Text>}
    <RNBarChart
      data={data}
      width={width - SPACING.lg * 2 - SPACING.xl * 2}
      height={160}
      yAxisLabel=""
      yAxisSuffix={suffix}
      chartConfig={{
        backgroundColor: 'transparent',
        backgroundGradientFrom: COLORS.card,
        backgroundGradientTo: COLORS.card,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
        labelColor: () => COLORS.textMuted,
        barPercentage: 0.6,
      }}
      style={{ borderRadius: RADIUS.md }}
      withInnerLines={false}
      showValuesOnTopOfBars
    />
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  title: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    marginBottom: SPACING.sm,
  },
});
