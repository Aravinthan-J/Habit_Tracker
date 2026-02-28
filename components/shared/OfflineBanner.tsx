import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';

export function OfflineBanner() {
    const { isOffline } = useAuthStore();
    if (!isOffline) return null;

    return (
        <View style={styles.banner}>
            <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
            <Text style={styles.text}>Offline mode — changes will sync when connectivity is restored</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        backgroundColor: '#E67E22',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        gap: 6,
    },
    text: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
});
