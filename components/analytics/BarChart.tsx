import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart as RNBarChart } from 'react-native-chart-kit';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { useUIStore } from '@/store/uiStore';

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
  const { premiumTheme } = useUIStore();
  const themeColors = premiumTheme?.colors || COLORS;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surface + '44', borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: themeColors.cardBorder || COLORS.cardBorder }]}>
      {title && <Text style={[styles.title, { color: themeColors.textPrimary }]}>{title}</Text>}
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
          labelColor: () => themeColors.textMuted,
          barPercentage: 0.6,
          propsForBackgroundLines: {
            strokeDasharray: '',
            strokeWidth: '0.5',
            stroke: themeColors.textMuted + '22',
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
