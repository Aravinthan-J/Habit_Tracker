import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { TYPOGRAPHY, SPACING, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface StepProgressRingProps {
  steps: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

export const StepProgressRing: React.FC<StepProgressRingProps> = ({
  steps,
  goal,
  size = 180,
  strokeWidth = 14,
}) => {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const progress = Math.min(steps / goal, 1);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedStroke = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedStroke, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = animatedStroke.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const pct = Math.round(progress * 100);

  return (
    <View style={styles.container} accessibilityLabel={`Step progress: ${steps} of ${goal} steps, ${pct}% complete`}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <SvgGradient id="stepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.primary} />
            <Stop offset="100%" stopColor={COLORS.accent} />
          </SvgGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.surface}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress — we draw as a static circle with computed offset */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#stepGrad)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference - progress * circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={styles.steps}>{steps.toLocaleString()}</Text>
        <Text style={styles.steps_label}>steps</Text>
        <Text style={styles.goal}>/ {goal.toLocaleString()}</Text>
      </View>
    </View>
  );
};

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  center: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  steps: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.bold,
  },
  steps_label: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sm,
  },
  goal: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.xs,
  },
});
