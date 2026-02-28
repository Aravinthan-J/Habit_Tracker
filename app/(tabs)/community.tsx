import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { useUIStore } from '@/store/uiStore';
import { LinearGradient } from 'expo-linear-gradient';
import { LeaderboardCard } from '@/components/community/LeaderboardCard';

// Dummy data for the leaderboard pending backend aggregation
const DUMMY_LEADERBOARD = [
    { id: '1', rank: 1, userName: 'Aravinthan J', streak: 142 },
    { id: '2', rank: 2, userName: 'ProductivityNinja', streak: 115 },
    { id: '3', rank: 3, userName: 'HabitHero99', streak: 87 },
    { id: '4', rank: 4, userName: 'EarlyBird', streak: 64 },
    { id: '5', rank: 5, userName: 'NightOwl_Coder', streak: 42 },
    { id: '6', rank: 6, userName: 'ZenMaster', streak: 38 },
];

export default function CommunityTab() {
    const { premiumTheme } = useUIStore();
    const colors = premiumTheme?.colors || COLORS;
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={[colors.surface, colors.background]}
                style={styles.header}
            >
                <Text style={[styles.title, { color: colors.textPrimary }]}>Community</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>Global Top Streaks</Text>
            </LinearGradient>

            <FlatList
                data={DUMMY_LEADERBOARD}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <LeaderboardCard
                        rank={item.rank}
                        userName={item.userName}
                        streak={item.streak}
                    />
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    header: {
        padding: SPACING.xl,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    title: {
        fontSize: TYPOGRAPHY.xxxl,
        fontWeight: TYPOGRAPHY.bold,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.sm,
        marginTop: 2,
        opacity: 0.8,
    },
    listContainer: {
        padding: SPACING.md,
    },
});
