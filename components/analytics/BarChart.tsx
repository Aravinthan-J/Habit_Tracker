import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';

interface BarChartProps {
  data: { labels: string[]; datasets: Array<{ data: number[] }> };
  color?: string;
  suffix?: string;
  maxValue?: number;
}

const BAR_AREA_HEIGHT = 120;

export const BarChart: React.FC<BarChartProps> = ({
  data,
  color = COLORS.primary,
  suffix = '',
  maxValue,
}) => {
  const values = data.datasets[0]?.data ?? [];
  const labels = data.labels;
  const max = maxValue ?? Math.max(...values, 1);

  return (
    <View style={styles.container}>
      {/* Y-axis hint */}
      <View style={styles.yHints}>
        <Text style={styles.yLabel}>{max}{suffix}</Text>
        <Text style={styles.yLabel}>{Math.round(max / 2)}{suffix}</Text>
        <Text style={styles.yLabel}>0</Text>
      </View>

      {/* Bars */}
      <View style={styles.barsArea}>
        {/* Grid lines */}
        <View style={[styles.gridLine, { bottom: BAR_AREA_HEIGHT }]} />
        <View style={[styles.gridLine, { bottom: BAR_AREA_HEIGHT / 2 }]} />
        <View style={[styles.gridLine, { bottom: 0 }]} />

        {values.map((val, i) => {
          const fillH = max > 0 ? Math.round((val / max) * BAR_AREA_HEIGHT) : 0;
          const isEmpty = val === 0;
          return (
            <View key={i} style={styles.barCol}>
              {/* Value label above bar */}
              <Text style={[styles.valueLabel, { color: isEmpty ? COLORS.textMuted : color }]}>
                {isEmpty ? '–' : `${val}${suffix}`}
              </Text>

              {/* Bar track + fill */}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: Math.max(fillH, isEmpty ? 0 : 3),
                      backgroundColor: isEmpty ? COLORS.surface : color,
                      opacity: isEmpty ? 0.4 : 1,
                    },
                  ]}
                />
              </View>

              {/* Day label */}
              <Text style={styles.dayLabel}>{labels[i]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.surface + '44',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },

  // Y-axis
  yHints: {
    justifyContent: 'space-between',
    height: BAR_AREA_HEIGHT + 20,
    alignItems: 'flex-end',
    paddingBottom: 20,
    marginRight: SPACING.sm,
  },
  yLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
  },

  // Bars area
  barsArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: BAR_AREA_HEIGHT + 40,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.textMuted + '20',
  },

  // Individual bar column
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: BAR_AREA_HEIGHT + 40,
  },
  valueLabel: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.semibold,
    marginBottom: 3,
    textAlign: 'center',
  },
  barTrack: {
    width: '60%',
    height: BAR_AREA_HEIGHT,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  dayLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.xs,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});
