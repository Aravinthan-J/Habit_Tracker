import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';

export interface NotifPayload {
    title: string;
    body: string;
}

interface Props {
    notif: NotifPayload | null;
    onDismiss: () => void;
    durationMs?: number;
}

const SLIDE_HEIGHT = 110;

export function InAppNotification({ notif, onDismiss, durationMs = 4000 }: Props) {
    const insets = useSafeAreaInsets();
    const translateY = useRef(new Animated.Value(-SLIDE_HEIGHT)).current;
    const progress   = useRef(new Animated.Value(1)).current;
    const autoTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [visible, setVisible] = useState(false);

    const dismiss = () => {
        if (autoTimer.current) clearTimeout(autoTimer.current);
        Animated.timing(translateY, {
            toValue: -SLIDE_HEIGHT,
            duration: 280,
            useNativeDriver: true,
        }).start(() => {
            setVisible(false);
            onDismiss();
        });
    };

    useEffect(() => {
        if (!notif) return;
        setVisible(true);
        progress.setValue(1);
        translateY.setValue(-SLIDE_HEIGHT);

        // Slide in
        Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 60,
            friction: 10,
        }).start();

        // Progress bar drain
        Animated.timing(progress, {
            toValue: 0,
            duration: durationMs,
            useNativeDriver: false,
        }).start();

        // Auto dismiss
        autoTimer.current = setTimeout(dismiss, durationMs);
        return () => {
            if (autoTimer.current) clearTimeout(autoTimer.current);
        };
    }, [notif]);

    // Swipe up to dismiss
    const pan = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 8 && g.dy < 0,
            onPanResponderMove: (_, g) => {
                if (g.dy < 0) translateY.setValue(g.dy);
            },
            onPanResponderRelease: (_, g) => {
                if (g.dy < -30) {
                    dismiss();
                } else {
                    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
                }
            },
        })
    ).current;

    if (!visible || !notif) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                { top: insets.top + SPACING.sm, transform: [{ translateY }] },
            ]}
            {...pan.panHandlers}
        >
            <View style={styles.card}>
                {/* Left accent */}
                <View style={styles.accent} />

                {/* Icon */}
                <View style={styles.iconWrap}>
                    <Ionicons name="notifications" size={20} color={COLORS.primary} />
                </View>

                {/* Text */}
                <View style={styles.textWrap}>
                    <Text style={styles.title} numberOfLines={1}>{notif.title}</Text>
                    <Text style={styles.body} numberOfLines={2}>{notif.body}</Text>
                </View>

                {/* Close */}
                <TouchableOpacity onPress={dismiss} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
            </View>

            {/* Progress bar */}
            <Animated.View
                style={[
                    styles.progressBar,
                    {
                        width: progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                        }),
                    },
                ]}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: SPACING.lg,
        right: SPACING.lg,
        zIndex: 9999,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        borderRadius: RADIUS.lg,
        paddingVertical: SPACING.md,
        paddingRight: SPACING.md,
        gap: SPACING.sm,
    },
    accent: {
        width: 4,
        alignSelf: 'stretch',
        backgroundColor: COLORS.primary,
        borderTopLeftRadius: RADIUS.lg,
        borderBottomLeftRadius: RADIUS.lg,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textWrap: {
        flex: 1,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.sm,
        fontWeight: TYPOGRAPHY.semibold,
        marginBottom: 2,
    },
    body: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.xs,
        lineHeight: 17,
    },
    closeBtn: {
        padding: SPACING.xs,
    },
    progressBar: {
        height: 3,
        backgroundColor: COLORS.primary,
        borderBottomLeftRadius: RADIUS.lg,
        borderBottomRightRadius: RADIUS.lg,
    },
});
