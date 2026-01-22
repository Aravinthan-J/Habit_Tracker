/**
 * Step Progress Ring Component
 * Displays a circular progress indicator showing steps vs goal
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';

interface StepProgressRingProps {
  steps: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function StepProgressRing({
  steps,
  goal,
  size = 120,
  strokeWidth = 12,
  showLabel = true,
}: StepProgressRingProps) {
  const percentage = Math.min((steps / goal) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color based on progress
  const getProgressColor = () => {
    if (percentage >= 100) return colors.success;
    if (percentage >= 75) return colors.secondary;
    if (percentage >= 50) return colors.info;
    if (percentage >= 25) return colors.warning;
    return colors.error;
  };

  const progressColor = getProgressColor();
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.stepsText}>{steps.toLocaleString()}</Text>
          <Text style={styles.goalText}>/ {goal.toLocaleString()}</Text>
          <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  stepsText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  goalText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  percentageText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginTop: spacing.xs,
  },
});
