import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart as RNLineChart } from 'react-native-chart-kit';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useUIStore } from '@/store/uiStore';

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
}) => {
  const { premiumTheme } = useUIStore();
  const themeColors = premiumTheme?.colors || COLORS;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surface + '44', borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: themeColors.cardBorder || COLORS.cardBorder }]}>
      {title && <Text style={[styles.title, { color: themeColors.textPrimary }]}>{title}</Text>}
      <RNLineChart
        data={data}
        width={width - SPACING.lg * 2 - SPACING.xl * 2 - SPACING.md * 2}
        height={200}
        chartConfig={{
          backgroundColor: 'transparent',
          backgroundGradientFrom: 'transparent',
          backgroundGradientTo: 'transparent',
          decimalPlaces: 0,
          color: (opacity = 1) => color,
          labelColor: () => themeColors.textMuted,
          style: { borderRadius: RADIUS.md },
          propsForDots: { r: '4', strokeWidth: '0', fill: color },
          propsForBackgroundLines: {
            strokeDasharray: '',
            strokeWidth: '0.5',
            stroke: themeColors.textMuted + '22',
          },
        }}
        bezier
        style={{ borderRadius: RADIUS.md, marginHorizontal: -SPACING.xs }}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
        withDots={true}
        withShadow={true}
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
