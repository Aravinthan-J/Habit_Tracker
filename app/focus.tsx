import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Accelerometer } from 'expo-sensors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { TYPOGRAPHY, SPACING, RADIUS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { playTimerComplete } from '@/utils/beepSound';
import { useAdvancedFeatures } from '@/hooks/useAdvancedFeatures';

const { width } = Dimensions.get('window');

const DURATIONS = [
    { label: '25 min', value: 25 * 60 },
    { label: '45 min', value: 45 * 60 },
    { label: '60 min', value: 60 * 60 },
];

export default function FocusMode() {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
    const router = useRouter();
    const { saveFocusSession } = useAdvancedFeatures();
    const [selectedDuration, setSelectedDuration] = useState(25 * 60);
    const [seconds, setSeconds] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isFaceDown, setIsFaceDown] = useState(false);
    const subscription = useRef<any>(null);
    const prevFaceDown = useRef(false);
    const startedAtRef = useRef<string | null>(null);

    // Accelerometer: detect face-down to auto-start
    useEffect(() => {
        subscription.current = Accelerometer.addListener((data) => {
            const faceDown = data.z < -0.8;
            setIsFaceDown(faceDown);

            // Auto-start when flipped face down, auto-pause when picked up
            if (faceDown && !prevFaceDown.current) {
                setIsActive(true);
            } else if (!faceDown && prevFaceDown.current) {
                setIsActive(false);
            }
            prevFaceDown.current = faceDown;
        });
        Accelerometer.setUpdateInterval(500);
        return () => {
            subscription.current?.remove();
            subscription.current = null;
        };
    }, []);

    // Timer countdown — runs whenever isActive, no face-down requirement
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isActive && seconds > 0) {
            if (!startedAtRef.current) startedAtRef.current = new Date().toISOString();
            interval = setInterval(() => setSeconds((s) => s - 1), 1000);
        } else if (seconds === 0 && isActive) {
            setIsActive(false);
            // Fire completion sound + strong haptic
            playTimerComplete();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Persist the completed session
            saveFocusSession.mutate({
                duration: Math.round(selectedDuration / 60),
                started_at: startedAtRef.current ?? new Date().toISOString(),
                ended_at: new Date().toISOString(),
                interrupted: false,
            });
            startedAtRef.current = null;
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const formatTime = (total: number) => {
        const m = Math.floor(total / 60).toString().padStart(2, '0');
        const s = (total % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const progress = 1 - seconds / selectedDuration;

    const handleToggle = () => {
        if (isActive) {
            setIsActive(false);
        } else {
            setIsActive(true);
        }
    };

    const handleReset = () => {
        setIsActive(false);
        setSeconds(selectedDuration);
        startedAtRef.current = null;
    };

    const handleDurationSelect = (value: number) => {
        if (isActive) return; // don't change while running
        setSelectedDuration(value);
        setSeconds(value);
    };

    const circumference = Math.PI * (width * 0.65);
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Focus Mode</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Duration selector */}
                <View style={styles.durationRow}>
                    {DURATIONS.map((d) => (
                        <TouchableOpacity
                            key={d.value}
                            style={[
                                styles.durationChip,
                                selectedDuration === d.value && styles.durationChipActive,
                                isActive && { opacity: 0.4 },
                            ]}
                            onPress={() => handleDurationSelect(d.value)}
                            disabled={isActive}
                        >
                            <Text style={[
                                styles.durationChipText,
                                selectedDuration === d.value && styles.durationChipTextActive,
                            ]}>
                                {d.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Timer ring */}
                <View style={styles.ringWrapper}>
                    <View style={[styles.ringOuter, { borderColor: COLORS.surface }]}>
                        <View style={[
                            styles.ringProgress,
                            {
                                borderColor: seconds === 0
                                    ? COLORS.success
                                    : isActive ? COLORS.primary : COLORS.textMuted + '40',
                            },
                        ]} />
                        <View style={styles.ringInner}>
                            <Text style={[
                                styles.timerText,
                                { color: isActive ? COLORS.textPrimary : COLORS.textMuted },
                            ]}>
                                {formatTime(seconds)}
                            </Text>
                            {seconds === 0 ? (
                                <Text style={[styles.timerLabel, { color: COLORS.success }]}>Complete! 🎉</Text>
                            ) : (
                                <Text style={styles.timerLabel}>
                                    {isActive ? 'Focusing…' : 'Ready'}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Face-down status */}
                <View style={styles.statusRow}>
                    <Ionicons
                        name={isFaceDown ? 'phone-portrait-outline' : 'phone-portrait-outline'}
                        size={18}
                        color={isFaceDown ? COLORS.success : COLORS.textMuted}
                    />
                    <Text style={[styles.statusText, { color: isFaceDown ? COLORS.success : COLORS.textMuted }]}>
                        {isFaceDown
                            ? 'Phone face-down — auto-pauses if picked up'
                            : 'Flip phone face-down to auto-start'}
                    </Text>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={styles.resetBtn}
                        onPress={handleReset}
                        disabled={seconds === selectedDuration && !isActive}
                    >
                        <Ionicons name="refresh" size={22} color={COLORS.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.mainBtn,
                            {
                                backgroundColor: seconds === 0
                                    ? COLORS.success
                                    : isActive ? COLORS.secondary : COLORS.primary,
                            },
                        ]}
                        onPress={seconds === 0 ? handleReset : handleToggle}
                    >
                        <Ionicons
                            name={seconds === 0 ? 'refresh' : isActive ? 'pause' : 'play'}
                            size={32}
                            color="#fff"
                        />
                    </TouchableOpacity>

                    <View style={{ width: 52 }} />
                </View>

                {/* Tips */}
                {!isActive && seconds === selectedDuration && (
                    <View style={styles.tipCard}>
                        <Text style={styles.tipTitle}>💡 How to use</Text>
                        <Text style={styles.tipText}>
                            Press Play or flip your phone face-down to start the timer.
                            Picking the phone back up will auto-pause your session.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const RING_SIZE = width * 0.72;

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    scroll: { flexGrow: 1, paddingBottom: 40 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.xl,
        fontWeight: TYPOGRAPHY.bold,
    },

    durationRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.sm,
        marginVertical: SPACING.lg,
        paddingHorizontal: SPACING.xl,
    },
    durationChip: {
        flex: 1,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
        borderWidth: 1.5,
        borderColor: COLORS.cardBorder,
        alignItems: 'center',
        backgroundColor: COLORS.surface,
    },
    durationChipActive: {
        backgroundColor: COLORS.primary + '22',
        borderColor: COLORS.primary,
    },
    durationChipText: {
        color: COLORS.textMuted,
        fontSize: TYPOGRAPHY.sm,
        fontWeight: TYPOGRAPHY.medium,
    },
    durationChipTextActive: {
        color: COLORS.primary,
        fontWeight: TYPOGRAPHY.bold,
    },

    ringWrapper: {
        alignItems: 'center',
        marginVertical: SPACING.xl,
    },
    ringOuter: {
        width: RING_SIZE,
        height: RING_SIZE,
        borderRadius: RING_SIZE / 2,
        borderWidth: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ringProgress: {
        position: 'absolute',
        width: RING_SIZE,
        height: RING_SIZE,
        borderRadius: RING_SIZE / 2,
        borderWidth: 6,
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
    },
    ringInner: {
        alignItems: 'center',
    },
    timerText: {
        fontSize: 56,
        fontWeight: TYPOGRAPHY.extrabold,
        letterSpacing: 2,
    },
    timerLabel: {
        color: COLORS.textMuted,
        fontSize: TYPOGRAPHY.sm,
        marginTop: 4,
        letterSpacing: 0.5,
    },

    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.xl,
        paddingHorizontal: SPACING.xl,
    },
    statusText: {
        fontSize: TYPOGRAPHY.sm,
        textAlign: 'center',
        flex: 1,
    },

    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xl,
        marginBottom: SPACING.xl,
    },
    resetBtn: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    mainBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    tipCard: {
        marginHorizontal: SPACING.xl,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    tipTitle: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.md,
        fontWeight: TYPOGRAPHY.semibold,
        marginBottom: SPACING.xs,
    },
    tipText: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.sm,
        lineHeight: 20,
    },
});
