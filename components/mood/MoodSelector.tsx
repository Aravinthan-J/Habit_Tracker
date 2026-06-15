import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TYPOGRAPHY, SPACING, RADIUS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useMood, MOODS } from '@/hooks/useMood';
import { useHaptics } from '@/hooks/useHaptics';

/** A compact "how are you feeling today?" row that logs today's mood. */
export function MoodSelector() {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const { todayMood, setMood } = useMood();
  const { light } = useHaptics();

  return (
    <View style={[styles.card, { backgroundColor: COLORS.surface + '66', borderColor: COLORS.cardBorder }]}>
      <Text style={[styles.title, { color: COLORS.textSecondary }]}>
        {todayMood ? 'Your mood today' : 'How are you feeling today?'}
      </Text>
      <View style={styles.row}>
        {MOODS.map((m) => {
          const active = todayMood === m.value;
          return (
            <TouchableOpacity
              key={m.value}
              onPress={() => { light(); setMood.mutate(m.value); }}
              style={[
                styles.moodBtn,
                active && { backgroundColor: COLORS.primary + '22', borderColor: COLORS.primary },
              ]}
              accessibilityLabel={`Mood: ${m.label}${active ? ', selected' : ''}`}
            >
              <Text style={[styles.emoji, !active && todayMood > 0 && styles.dim]}>{m.emoji}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
  card: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
  },
  title: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.medium, marginBottom: SPACING.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  emoji: { fontSize: 26 },
  dim: { opacity: 0.45 },
});
