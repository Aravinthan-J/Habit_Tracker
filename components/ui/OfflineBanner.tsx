import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface OfflineBannerProps {
  isOnline: boolean;
  isSyncing: boolean;
}

export function OfflineBanner({ isOnline, isSyncing }: OfflineBannerProps) {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const translateY = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isOnline ? -60 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnline]);

  const label = isSyncing ? 'Back online — syncing…' : 'No internet connection';
  const icon: any = isSyncing ? 'sync-outline' : 'cloud-offline-outline';
  const bg = isSyncing ? COLORS.primary : COLORS.warning;

  return (
    <Animated.View style={[styles.banner, { backgroundColor: bg, transform: [{ translateY }] }]}>
      <Ionicons name={icon} size={16} color="#fff" />
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    zIndex: 999,
  },
  label: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
  },
});
