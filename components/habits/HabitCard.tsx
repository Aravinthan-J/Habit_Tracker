import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useUIStore } from '@/store/uiStore';
import { Habit } from '@/types/habit.types';
import { HabitCheckbox } from './HabitCheckbox';
import { useHaptics } from '@/hooks/useHaptics';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  streak: number;
  onToggle: () => void;
  onPress: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = React.memo(({
  habit,
  isCompleted,
  streak,
  onToggle,
  onPress,
}) => {
  const { premiumTheme } = useUIStore();
  const themeColors = premiumTheme?.colors || COLORS;
  const { light } = useHaptics();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleToggle = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    light();
    onToggle();
  }, [onToggle, light]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        accessibilityLabel={`${habit.title}, ${isCompleted ? 'completed' : 'not completed'}, ${streak} day streak`}
      >
        <View style={[
          styles.card,
          {
            backgroundColor: themeColors.surface + '66', // Glass effect
            borderColor: themeColors.cardBorder || COLORS.cardBorder
          }
        ]}>
          <View style={[styles.glowBar, { backgroundColor: habit.color }]} />

          <View style={styles.content}>
            <View style={styles.left}>
              <View style={[styles.iconCircle, { backgroundColor: habit.color + '25', borderColor: habit.color + '40', borderWidth: 1 }]}>
                <Text style={styles.icon}>{habit.icon ?? '✨'}</Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.title, { color: themeColors.textPrimary }]} numberOfLines={1}>{habit.title}</Text>
                {streak > 0 && (
                  <View style={styles.streakRow}>
                    <Text style={styles.fire}>🔥</Text>
                    <Text style={[styles.streak, { color: habit.color }]}>
                      {streak} day streak
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <HabitCheckbox
              isCompleted={isCompleted}
              color={habit.color}
              onToggle={handleToggle}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    flexDirection: 'row',
    ...SHADOWS.small,
  },
  glowBar: {
    width: 6,
    height: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  icon: { fontSize: 22 },
  info: { flex: 1 },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
  },
  streakRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  fire: { fontSize: 12, marginRight: 2 },
  streak: { fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.medium },
});
