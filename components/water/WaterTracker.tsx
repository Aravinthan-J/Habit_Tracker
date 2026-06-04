import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { useWater } from '@/hooks/useWater';
import { useHaptics } from '@/hooks/useHaptics';

const GOAL_OPTIONS = [6, 8, 10, 12];
const WATER_BLUE = '#3BA7FF';

export const WaterTracker: React.FC = () => {
    const { glasses, goal, increment, decrement, setGoal } = useWater();
    const { light } = useHaptics();

    const reached = glasses >= goal;
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
