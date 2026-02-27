import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { useUIStore } from '@/store/uiStore';
import { Achievement } from '@/types/advanced.types';

interface AchievementPreviewProps {
    achievements: Achievement[];
}

export default function AchievementPreview({ achievements }: AchievementPreviewProps) {
    const { premiumTheme } = useUIStore();
    const colors = premiumTheme?.colors || COLORS;

    if (achievements.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Recent Wins</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {achievements.map((item) => (
                    <View key={item.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder || COLORS.cardBorder }]}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name={item.icon as any} size={24} color={colors.primary} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                                {item.title}
                            </Text>
                            <Text style={[styles.date, { color: colors.textMuted }]}>
                                {new Date(item.earned_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: TYPOGRAPHY.medium,
        marginHorizontal: SPACING.xl,
        marginBottom: SPACING.md,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    scroll: {
        paddingHorizontal: SPACING.xl,
        gap: SPACING.md,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        width: 200,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: TYPOGRAPHY.md,
        fontWeight: TYPOGRAPHY.bold,
    },
    date: {
        fontSize: TYPOGRAPHY.xs,
        marginTop: 2,
    },
});
