import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { useWater } from '@/hooks/useWater';
import { useHaptics } from '@/hooks/useHaptics';
import { useHabits } from '@/hooks/useHabits';
import { useCompletions } from '@/hooks/useCompletions';
import { usePreferences } from '@/hooks/usePreferences';
import { useNotifications } from '@/hooks/useNotifications';
import { today } from '@/utils/dateHelpers';

const GOAL_OPTIONS = [6, 8, 10, 12];
const WATER_BLUE = '#3BA7FF';

export const WaterTracker: React.FC = () => {
    const { glasses, goal, increment, decrement, setGoal } = useWater();
    const { light, success } = useHaptics();
    const { habits } = useHabits();
    const { completions, toggleCompletion } = useCompletions();

    const reached = glasses >= goal;

    // When the daily goal is reached, auto-complete a "Drink Water" habit (once/day).
    const waterHabit = habits.find((h) => h.title.toLowerCase().includes('water'));
    const dateStr = today();
    const waterHabitDone =
        !!waterHabit && completions.some((c) => c.habit_id === waterHabit.id && c.date === dateStr);
    const autoCompletedRef = useRef<string | null>(null);

    useEffect(() => {
        if (reached && waterHabit && !waterHabitDone && autoCompletedRef.current !== dateStr) {
            autoCompletedRef.current = dateStr;
            success?.();
            toggleCompletion.mutate({ habitId: waterHabit.id, date: dateStr, isCompleted: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reached, waterHabit?.id, waterHabitDone, dateStr]);

    // Stop nagging once today's goal is reached; resume reminders on a new day
    // (or if the user drops back below goal). Only when reminders are enabled.
    const { waterReminderEnabled, waterIntervalHours } = usePreferences();
    const { scheduleWater, cancelWater } = useNotifications();
    const reminderStateRef = useRef<string | null>(null);

    useEffect(() => {
        if (!waterReminderEnabled) return;
        if (reached && reminderStateRef.current !== `off-${dateStr}`) {
            cancelWater();
            reminderStateRef.current = `off-${dateStr}`;
        } else if (!reached && reminderStateRef.current !== `on-${dateStr}`) {
            scheduleWater(waterIntervalHours);
            reminderStateRef.current = `on-${dateStr}`;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reached, waterReminderEnabled, waterIntervalHours, dateStr]);
    const cycleGoal = () => {
        light();
        const next = GOAL_OPTIONS[(GOAL_OPTIONS.indexOf(goal) + 1) % GOAL_OPTIONS.length];
        setGoal(next);
    };
    const onInc = () => { light(); increment(); };
    const onDec = () => { light(); decrement(); };

    // Render up to `goal` glass icons (filled = consumed).
    const icons = Array.from({ length: goal }, (_, i) => i < glasses);

    return (
        <View style={[styles.card, { backgroundColor: COLORS.card, borderColor: COLORS.cardBorder }]}>
            <View style={styles.headerRow}>
                <Text style={[styles.title, { color: COLORS.textSecondary }]}>Water</Text>
                <TouchableOpacity onPress={cycleGoal} hitSlop={8}>
                    <Text style={[styles.goalText, { color: COLORS.textMuted }]}>Goal: {goal}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.glassesWrap}>
                {icons.map((filled, i) => (
                    <Ionicons
                        key={i}
                        name={filled ? 'water' : 'water-outline'}
                        size={22}
                        color={filled ? WATER_BLUE : COLORS.textMuted + '66'}
                        style={styles.glassIcon}
                    />
                ))}
            </View>

            <View style={styles.controls}>
                <TouchableOpacity
                    onPress={onDec}
                    disabled={glasses <= 0}
                    style={[styles.btn, { borderColor: COLORS.cardBorder, opacity: glasses <= 0 ? 0.4 : 1 }]}
                    accessibilityLabel="Remove a glass of water"
                >
                    <Ionicons name="remove" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>

                <View style={styles.countWrap}>
                    <Text style={[styles.count, { color: reached ? COLORS.success : COLORS.textPrimary }]}>
                        {glasses}
                        <Text style={[styles.countGoal, { color: COLORS.textMuted }]}> / {goal}</Text>
                    </Text>
                    <Text style={[styles.countLabel, { color: reached ? COLORS.success : COLORS.textMuted }]}>
                        {reached ? '🎉 Goal reached!' : 'glasses'}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={onInc}
                    style={[styles.btn, styles.btnAdd, { backgroundColor: WATER_BLUE }]}
                    accessibilityLabel="Add a glass of water"
                >
                    <Ionicons name="add" size={22} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: SPACING.xl,
        marginBottom: SPACING.lg,
        padding: SPACING.xl,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: TYPOGRAPHY.medium,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    goalText: { fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.medium },
    glassesWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.md, marginBottom: SPACING.md },
    glassIcon: { marginRight: 6, marginBottom: 4 },
    controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    btn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnAdd: { borderWidth: 0 },
    countWrap: { alignItems: 'center', flex: 1 },
    count: { fontSize: TYPOGRAPHY.xxl, fontWeight: TYPOGRAPHY.bold },
    countGoal: { fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.medium },
    countLabel: { fontSize: TYPOGRAPHY.xs, marginTop: 2 },
});
