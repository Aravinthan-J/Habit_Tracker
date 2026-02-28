import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { useUIStore } from '@/store/uiStore';
import { Ionicons } from '@expo/vector-icons';

interface LeaderboardCardProps {
    rank: number;
    userName: string;
    streak: number;
    avatarUrl?: string;
}

export const LeaderboardCard = ({ rank, userName, streak, avatarUrl }: LeaderboardCardProps) => {
    const { premiumTheme } = useUIStore();
    const colors = premiumTheme?.colors || COLORS;

    let rankColor = colors.textPrimary;
    if (rank === 1) rankColor = COLORS.gold;
    if (rank === 2) rankColor = '#C0C0C0'; // Silver
    if (rank === 3) rankColor = '#CD7F32'; // Bronze

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.cardBorder || COLORS.cardBorder }]}>
            <View style={styles.rankContainer}>
                <Text style={[styles.rankText, { color: rankColor }]}>#{rank}</Text>
            </View>

            <View style={styles.userContainer}>
                {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceLight }]}>
                        <Ionicons name="person" size={20} color={colors.textMuted} />
                    </View>
                )}
                <Text style={[styles.userName, { color: colors.textPrimary }]}>{userName}</Text>
            </View>

            <View style={styles.streakContainer}>
                <Ionicons name="flame" size={16} color={COLORS.secondary} style={{ marginRight: 4 }} />
                <Text style={[styles.streakText, { color: colors.textPrimary }]}>{streak}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        marginBottom: SPACING.sm,
    },
    rankContainer: {
        width: 40,
        alignItems: 'center',
    },
    rankText: {
        fontSize: TYPOGRAPHY.lg,
        fontWeight: TYPOGRAPHY.bold,
    },
    userContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: SPACING.sm,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: SPACING.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: TYPOGRAPHY.md,
        fontWeight: TYPOGRAPHY.medium,
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
    },
    streakText: {
        fontSize: TYPOGRAPHY.md,
        fontWeight: TYPOGRAPHY.bold,
    },
});
