/**
 * Line Chart Component
 * Simple line chart for displaying trends
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Path, Text as SvgText } from 'react-native-svg';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import type { TrendData } from '@habit-tracker/api-client';

interface LineChartProps {
  data: TrendData[];
  title?: string;
  height?: number;
}

export function LineChart({ data, title, height = 200 }: LineChartProps) {
  const width = Dimensions.get('window').width - spacing.lg * 2;
  const chartWidth = width - 60;
  const chartHeight = height - 60;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  if (data.length === 0) {
    return (
      <View style={styles.card}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={[styles.emptyContainer, { height }]}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  // Calculate scales
  const maxValue = Math.max(...data.map((d) => d.completionRate), 100);
  const minValue = 0;

  // Generate path points
  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartWidth;
    const y =
      padding.top +
      chartHeight -
      ((d.completionRate - minValue) / (maxValue - minValue)) * chartHeight;
    return { x, y, value: d.completionRate };
  });

  // Create SVG path
  const pathData = points
    .map((point, i) => {
      if (i === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `L ${point.x} ${point.y}`;
    })
    .join(' ');

  // Format date for labels
  const getDateLabel = (dateString: string, index: number) => {
    if (data.length <= 7) return new Date(dateString).getDate().toString();
    if (index % 5 === 0 || index === data.length - 1) {
      return new Date(dateString).getDate().toString();
    }
    return '';
  };

  return (
    <View style={styles.card}>
      {title && <Text style={styles.title}>{title}</Text>}
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((value) => {
          const y =
            padding.top +
            chartHeight -
            ((value - minValue) / (maxValue - minValue)) * chartHeight;
          return (
            <Line
              key={value}
              x1={padding.left}
              y1={y}
              x2={padding.left + chartWidth}
              y2={y}
              stroke={colors.border}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          );
        })}

        {/* Y-axis labels */}
        {[0, 25, 50, 75, 100].map((value) => {
          const y =
            padding.top +
            chartHeight -
            ((value - minValue) / (maxValue - minValue)) * chartHeight;
          return (
            <SvgText
              key={value}
              x={padding.left - 10}
              y={y + 4}
              fontSize="10"
              fill={colors.textLight}
              textAnchor="end"
            >
              {value}%
            </SvgText>
          );
        })}

        {/* Line path */}
        <Path
          d={pathData}
          stroke={colors.primary}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <Circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={colors.primary}
            stroke={colors.white}
            strokeWidth="2"
          />
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const label = getDateLabel(d.date, i);
          if (!label) return null;
          return (
            <SvgText
              key={i}
              x={points[i].x}
              y={padding.top + chartHeight + 20}
              fontSize="10"
              fill={colors.textLight}
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
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
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
  },
});
