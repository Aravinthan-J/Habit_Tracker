import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore } from '@/store/uiStore';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

export default function FocusMode() {
    const { premiumTheme } = useUIStore();
    const colors = premiumTheme?.colors || COLORS;

    const [isActive, setIsActive] = useState(false);
    const [seconds, setSeconds] = useState(25 * 60);
    const [isFaceDown, setIsFaceDown] = useState(false);
    const [data, setData] = useState({ x: 0, y: 0, z: 0 });
    const subscription = useRef<any>(null);

    useEffect(() => {
        _subscribe();
        return () => _unsubscribe();
    }, []);

    useEffect(() => {
        let interval: any;
        if (isActive && seconds > 0 && isFaceDown) {
            interval = setInterval(() => {
                setSeconds((prev) => prev - 1);
            }, 1000);
        } else if (seconds === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds, isFaceDown]);

    const _subscribe = () => {
        subscription.current = Accelerometer.addListener((accelerometerData) => {
            setData(accelerometerData);
            // Z < -0.9 implies the phone is likely face down
            const faceDown = accelerometerData.z < -0.9;
            setIsFaceDown(faceDown);
        });
        Accelerometer.setUpdateInterval(500);
    };

    const _unsubscribe = () => {
        subscription.current && subscription.current.remove();
        subscription.current = null;
    };

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleFocus = () => {
        setIsActive(!isActive);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Analog Focus</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Flip your phone face down to start
                </Text>
            </View>

            <View style={styles.timerContainer}>
                <Text style={[styles.timer, { color: isActive ? colors.primary : colors.textMuted }]}>
                    {formatTime(seconds)}
                </Text>
            </View>

            <View style={styles.statusContainer}>
                {isFaceDown ? (
                    <View style={styles.activeStatus}>
                        <Ionicons name="checkmark-circle" size={24} color={colors.success || COLORS.success} />
                        <Text style={[styles.statusText, { color: colors.success || COLORS.success }]}>
                            Focused & Face Down
                        </Text>
                    </View>
                ) : (
                    <View style={styles.inactiveStatus}>
                        <Ionicons name="alert-circle" size={24} color={colors.textMuted} />
                        <Text style={[styles.statusText, { color: colors.textMuted }]}>
                            Flip phone down to deep work
                        </Text>
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: isActive ? colors.secondary : colors.primary }]}
                onPress={toggleFocus}
            >
                <Text style={styles.buttonText}>{isActive ? 'STOP SESSION' : 'START FOCUS'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xxxl,
    },
    title: {
        fontSize: TYPOGRAPHY.xxxl,
        fontWeight: TYPOGRAPHY.bold,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.md,
        textAlign: 'center',
    },
    timerContainer: {
        width: width * 0.7,
        height: width * 0.7,
        borderRadius: (width * 0.7) / 2,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xxxl,
    },
    timer: {
        fontSize: 64,
        fontWeight: TYPOGRAPHY.extrabold,
    },
    statusContainer: {
        marginBottom: SPACING.xxxl,
    },
    activeStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inactiveStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        marginLeft: SPACING.sm,
        fontSize: TYPOGRAPHY.md,
        fontWeight: TYPOGRAPHY.medium,
    },
    button: {
        width: '100%',
        paddingVertical: SPACING.lg,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: TYPOGRAPHY.lg,
        fontWeight: TYPOGRAPHY.bold,
    },
});
