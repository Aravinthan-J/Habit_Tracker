import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { BadgeWithStatus } from '@/types/badge.types';
import { TIER_COLORS, TIER_GLOW } from '@/constants/badges';

const TIER_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    bronze: 'medal-outline',
    silver: 'ribbon-outline',
    gold: 'trophy-outline',
    platinum: 'diamond-outline',
};

const TYPE_LABELS: Record<string, string> = {
    streak: 'Streak',
    completion: 'Completion',
    step: 'Steps',
    special: 'Special',
};

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    streak: 'flame-outline',
    completion: 'checkmark-circle-outline',
    step: 'footsteps-outline',
    special: 'star-outline',
};

interface BadgeDetailModalProps {
    badge: BadgeWithStatus | null;
    visible: boolean;
    onClose: () => void;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({ badge, visible, onClose }) => {
    if (!badge) return null;

    const tierColor = TIER_COLORS[badge.tier];
    const glowColor = TIER_GLOW[badge.tier];

    const earnedDate = badge.earned_at
        ? new Date(badge.earned_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            accessibilityViewIsModal
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity activeOpacity={1} style={styles.sheet}>
                    <LinearGradient colors={[COLORS.surface, COLORS.card]} style={styles.content}>
                        {/* Drag handle */}
                        <View style={styles.handle} />

                        {/* Icon */}
                        <View style={[styles.iconRing, { borderColor: badge.earned ? tierColor : COLORS.cardBorder }]}>
                            {badge.earned && (
                                <LinearGradient
                                    colors={[glowColor, 'transparent']}
                                    style={StyleSheet.absoluteFillObject}
                                />
                            )}
                            <Ionicons
                                name={TIER_ICONS[badge.tier]}
                                size={48}
                                color={badge.earned ? tierColor : COLORS.textMuted}
                            />
                            {!badge.earned && (
                                <View style={styles.lockBadge}>
                                    <Ionicons name="lock-closed" size={14} color={COLORS.textMuted} />
                                </View>
                            )}
                        </View>

                        {/* Name */}
                        <Text style={[styles.name, { color: badge.earned ? tierColor : COLORS.textPrimary }]}>
                            {badge.name}
                        </Text>

                        {/* Chips row */}
                        <View style={styles.chips}>
                            <View style={[styles.chip, { backgroundColor: tierColor + '22' }]}>
                                <Ionicons name={TIER_ICONS[badge.tier]} size={12} color={tierColor} />
                                <Text style={[styles.chipText, { color: tierColor }]}>
                                    {badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)}
                                </Text>
                            </View>
                            <View style={[styles.chip, { backgroundColor: COLORS.surface }]}>
                                <Ionicons name={TYPE_ICONS[badge.type]} size={12} color={COLORS.textSecondary} />
                                <Text style={[styles.chipText, { color: COLORS.textSecondary }]}>
                                    {TYPE_LABELS[badge.type]}
                                </Text>
                            </View>
                        </View>

                        {/* Description */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>HOW TO EARN</Text>
                            <Text style={styles.description}>{badge.description}</Text>
                        </View>

                        {/* Status */}
                        {badge.earned ? (
                            <View style={[styles.statusRow, { backgroundColor: COLORS.success + '22' }]}>
                                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                                <Text style={[styles.statusText, { color: COLORS.success }]}>
                                    Earned{earnedDate ? ` on ${earnedDate}` : ''}
                                </Text>
                            </View>
                        ) : (
                            <View style={[styles.statusRow, { backgroundColor: COLORS.surface }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} />
                                <Text style={[styles.statusText, { color: COLORS.textMuted }]}>
                                    Keep going to unlock this badge
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close">
                            <Text style={styles.closeBtnText}>Close</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: COLORS.overlay,
        justifyContent: 'flex-end',
    },
    sheet: {
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        overflow: 'hidden',
    },
    content: {
        padding: SPACING.xl,
        alignItems: 'center',
        paddingBottom: SPACING.xxxl,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.cardBorder,
        marginBottom: SPACING.xl,
    },
    iconRing: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        overflow: 'hidden',
        backgroundColor: COLORS.card,
    },
    lockBadge: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        backgroundColor: COLORS.card,
        borderRadius: 10,
        padding: 3,
    },
    name: {
        fontSize: TYPOGRAPHY.xl,
        fontWeight: TYPOGRAPHY.bold,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    chips: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.xl,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
    },
    chipText: {
        fontSize: TYPOGRAPHY.xs,
        fontWeight: TYPOGRAPHY.semibold,
        letterSpacing: 0.3,
    },
    section: {
        width: '100%',
        marginBottom: SPACING.lg,
    },
    sectionLabel: {
        color: COLORS.textMuted,
        fontSize: TYPOGRAPHY.xs,
        fontWeight: TYPOGRAPHY.bold,
        letterSpacing: 1,
        marginBottom: SPACING.xs,
    },
    description: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.md,
        lineHeight: 22,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        width: '100%',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.xl,
    },
    statusText: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: TYPOGRAPHY.medium,
    },
    closeBtn: {
        width: '100%',
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.md,
        alignItems: 'center',
    },
    closeBtnText: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.md,
        fontWeight: TYPOGRAPHY.semibold,
    },
});
