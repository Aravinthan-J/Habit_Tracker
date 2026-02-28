import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';

interface GoogleButtonProps {
  onPress: () => void;
  loading?: boolean;
  label?: string;
}

export function GoogleButton({ onPress, loading = false, label = 'Continue with Google' }: GoogleButtonProps) {
  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.textPrimary} />
      ) : (
        <Ionicons name="logo-google" size={20} color="#EA4335" />
      )}
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 50,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.surface,
  },
  text: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
  },
});
