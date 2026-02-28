import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '@/constants/theme';

interface HabitCheckboxProps {
  isCompleted: boolean;
  color: string;
  onToggle: () => void;
  size?: number;
}

export const HabitCheckbox: React.FC<HabitCheckboxProps> = ({
  isCompleted,
  color,
  onToggle,
  size = 32,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isCompleted ? 1.15 : 1,
        useNativeDriver: true,
        damping: 10,
      }),
      Animated.timing(checkAnim, {
        toValue: isCompleted ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isCompleted]);

  const bgColor = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', color],
  });

  const borderColor = isCompleted ? color : COLORS.textMuted;

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      accessibilityLabel={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isCompleted }}
    >
      <Animated.View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor,
            backgroundColor: bgColor as any,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {isCompleted && (
          <Animated.View style={{ opacity: checkAnim, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="checkmark" size={size * 0.55} color={COLORS.textPrimary} />
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
