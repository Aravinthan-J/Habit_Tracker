import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart as RNLineChart } from 'react-native-chart-kit';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface LineChartProps {
  data: { labels: string[]; datasets: Array<{ data: number[] }> };
  title?: string;
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  color = COLORS.primary,
}) => (
  <View style={styles.container}>
    {title && <Text style={styles.title}>{title}</Text>}
    <RNLineChart
      data={data}
      width={width - SPACING.lg * 2 - SPACING.xl * 2}
      height={180}
      chartConfig={{
        backgroundColor: 'transparent',
        backgroundGradientFrom: COLORS.card,
        backgroundGradientTo: COLORS.card,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
        labelColor: () => COLORS.textMuted,
        style: { borderRadius: RADIUS.md },
        propsForDots: { r: '4', strokeWidth: '2', stroke: color },
      }}
      bezier
      style={{ borderRadius: RADIUS.md, marginHorizontal: -SPACING.xs }}
      withInnerLines={false}
      withOuterLines={false}
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
