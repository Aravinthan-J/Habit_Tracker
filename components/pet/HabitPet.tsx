import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { usePet } from '@/hooks/usePet';
import { useHaptics } from '@/hooks/useHaptics';
import { PetTier } from '@/constants/petMessages';

const TIER_COLOR: Record<PetTier, string> = {
    thriving: COLORS.success,
    happy: COLORS.success,
    meh: '#E0A82E',
    sad: '#E8833A',
    hangry: COLORS.error ?? '#E5484D',
};

export const HabitPet: React.FC = () => {
    const { name, health, tier, tierLabel, face, message, tone, setTone } = usePet();
    const { light } = useHaptics();
    const scale = useRef(new Animated.Value(1)).current;

    // Gentle idle "breathing" pulse so the pet feels alive.
    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(scale, { toValue: 1.08, duration: 1100, useNativeDriver: true }),
                Animated.timing(scale, { toValue: 1, duration: 1100, useNativeDriver: true }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [scale]);

    const color = TIER_COLOR[tier];
    const toggleTone = () => {
        light();
        setTone(tone === 'gentle' ? 'savage' : 'gentle');
    };

    return (
        <View style={[styles.card, { backgroundColor: COLORS.card, borderColor: COLORS.cardBorder }]}>
            <View style={styles.row}>
                <Animated.Text style={[styles.face, { transform: [{ scale }] }]}>{face}</Animated.Text>

                <View style={styles.body}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.name, { color: COLORS.textPrimary }]}>{name}</Text>
                        <Text style={[styles.tierLabel, { color }]}>{tierLabel}</Text>
                    </View>

                    {/* Health bar */}
                    <View style={[styles.healthTrack, { backgroundColor: COLORS.surface }]}>
                        <View style={[styles.healthFill, { width: `${health}%`, backgroundColor: color }]} />
                    </View>

                    {/* Speech bubble */}
                    <Text style={[styles.message, { color: COLORS.textSecondary }]}>{message}</Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={toggleTone}
                style={[styles.toneChip, { borderColor: COLORS.cardBorder, backgroundColor: COLORS.surface }]}
                accessibilityLabel={`Pet tone: ${tone}. Tap to switch.`}
            >
                <Text style={styles.toneText}>{tone === 'gentle' ? '😇 Gentle' : '🔥 Savage'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: SPACING.xl,
        marginTop: SPACING.md,
        marginBottom: SPACING.lg,
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    face: { fontSize: 52, marginRight: SPACING.lg },
    body: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    name: { fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.bold },
    tierLabel: { fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.semibold },
    healthTrack: { height: 7, borderRadius: 4, overflow: 'hidden', marginTop: SPACING.sm },
    healthFill: { height: '100%', borderRadius: 4 },
    message: { fontSize: TYPOGRAPHY.sm, marginTop: SPACING.sm, lineHeight: 18 },
    toneChip: {
        alignSelf: 'flex-end',
        marginTop: SPACING.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
    },
    toneText: { fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.semibold, color: COLORS.textSecondary },
});
