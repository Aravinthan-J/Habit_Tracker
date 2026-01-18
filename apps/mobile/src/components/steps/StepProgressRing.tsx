import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

interface StepProgressRingProps {
  currentSteps: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

const StepProgressRing: React.FC<StepProgressRingProps> = ({
  currentSteps,
  goal,
  size = 200,
  strokeWidth = 20,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = goal > 0 ? currentSteps / goal : 0;
  const strokeDashoffset = circumference - circumference * Math.min(progress, 1);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          stroke="#e6e6e6"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke="url(#grad)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6C63FF" />
            <stop offset="1" stopColor="#45B7D1" />
        </LinearGradient>
      </Svg>
      <View style={styles.textContainer}>
        <Text style={styles.stepsText}>{currentSteps}</Text>
        <Text style={styles.goalText}>of {goal}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepsText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  goalText: {
    fontSize: 16,
    color: '#666',
  },
});

export default StepProgressRing;
