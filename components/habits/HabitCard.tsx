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
import { Habit } from '@/types/habit.types';
import { HabitCheckbox } from './HabitCheckbox';
import { useHaptics } from '@/hooks/useHaptics';
import { resolveIcon } from '@/utils/iconHelpers';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  streak: number;
  onToggle: () => void;
  onPress: () => void;
  monthlyCount: number;
  monthlyGoal: number;
  /** Last 7 days as '1'/'0' chars (oldest→newest, today last). Passed as a
   *  string so React.memo stays effective. */
  weekStatus?: string;
  /** Weekday initials for the 7 days, e.g. "SMTWTFS" aligned with weekStatus. */
  weekLabels?: string;
}

export const HabitCard: React.FC<HabitCardProps> = React.memo(({
  habit,
  isCompleted,
  streak,
  onToggle,
  onPress,
  monthlyCount,
  monthlyGoal,
  weekStatus,
  weekLabels,
}) => {
  const { light } = useHaptics();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const goalReached = monthlyGoal > 0 && monthlyCount >= monthlyGoal;
  // Only lock new check-ins; already-completed habits can still be unchecked
  const checkboxDisabled = goalReached && !isCompleted;

  const handleToggle = useCallback(() => {
    if (checkboxDisabled) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    light();
    onToggle();
  }, [onToggle, light, checkboxDisabled]);

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
            backgroundColor: COLORS.surface + '66', // Glass effect
            borderColor: COLORS.cardBorder
          }
        ]}>
          <View style={[styles.glowBar, { backgroundColor: habit.color }]} />

          <View style={styles.content}>
            <View style={styles.left}>
              <View style={[styles.iconCircle, { backgroundColor: habit.color + '25', borderColor: habit.color + '40', borderWidth: 1 }]}>
                <Text style={styles.icon}>{resolveIcon(habit.icon)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.title, { color: COLORS.textPrimary }]} numberOfLines={1}>{habit.title}</Text>
                {streak > 0 && (
                  <View style={styles.streakRow}>
                    <Text style={styles.fire}>🔥</Text>
                    <Text style={[styles.streak, { color: habit.color }]}>
                      {streak} day streak
                    </Text>
                  </View>
                )}
                {monthlyGoal > 0 && (
                  <Text style={[styles.monthlyText, { color: goalReached ? COLORS.success : COLORS.textMuted }]}>
                    {goalReached ? `🎯 ${monthlyGoal}/${monthlyGoal} Goal met!` : `${monthlyCount}/${monthlyGoal} this month`}
                  </Text>
                )}
                {weekStatus?.length === 7 && (
                  <View style={styles.weekRow}>
                    {weekStatus.split('').map((ch, i) => {
                      const done = ch === '1';
                      const isToday = i === 6;
                      return (
                        <View key={i} style={styles.weekDay}>
                          <View
                            style={[
                              styles.weekDot,
                              done
                                ? { backgroundColor: habit.color }
                                : { borderWidth: 1.5, borderColor: COLORS.cardBorder },
                              isToday && !done && { borderColor: habit.color },
                            ]}
                          />
                          {!!weekLabels && (
                            <Text style={[styles.weekLabel, { color: isToday ? habit.color : COLORS.textMuted }]}>
                              {weekLabels[i]}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
            <HabitCheckbox
              isCompleted={isCompleted}
              color={habit.color}
              onToggle={handleToggle}
              disabled={checkboxDisabled}
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
    flex: 1,
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
  monthlyText: { fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.medium, marginTop: 2 },
  weekRow: { flexDirection: 'row', marginTop: 8 },
  weekDay: { alignItems: 'center', marginRight: 9 },
  weekDot: { width: 9, height: 9, borderRadius: 5, marginBottom: 3 },
  weekLabel: { fontSize: 9, fontWeight: TYPOGRAPHY.medium },
});
