import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { passwordStrength } from '@/utils/validators';

const STRENGTH_COLORS = ['#F44336', '#FF9800', '#FFEB3B', '#4CAF50'];
const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong'];

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const strength = passwordStrength(password);

  const handleRegister = async () => {
    setError(null);
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreed) {
      setError('Please accept the terms to continue.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: authError } = await signUp(email.trim(), password, name.trim());
      if (authError) {
        setError(authError.message);
      } else {
        router.replace('/(auth)/onboarding');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your habit journey</Text>
        </View>

        <Input
          label="Full Name"
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          leftIcon="person-outline"
          autoCapitalize="words"
          accessibilityLabel="Full name input"
        />
        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          leftIcon="mail-outline"
          accessibilityLabel="Email input"
          autoComplete="email"
        />
        <Input
          label="Password"
          placeholder="Create a strong password"
          value={password}
          onChangeText={setPassword}
          isPassword
          leftIcon="lock-closed-outline"
          accessibilityLabel="Password input"
        />

        {/* Password strength */}
        {password.length > 0 && (
          <View style={styles.strengthContainer}>
            <View style={styles.strengthBar}>
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.strengthSegment,
                    { backgroundColor: i <= strength - 1 ? STRENGTH_COLORS[strength - 1] : COLORS.surfaceLight },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.strengthLabel, { color: STRENGTH_COLORS[strength - 1] ?? COLORS.textMuted }]}>
              {strength > 0 ? STRENGTH_LABELS[strength - 1] : ''}
            </Text>
          </View>
        )}

        <Input
          label="Confirm Password"
          placeholder="Repeat your password"
          value={confirm}
          onChangeText={setConfirm}
          isPassword
          leftIcon="shield-checkmark-outline"
          accessibilityLabel="Confirm password input"
        />

        {/* Terms */}
        <View style={styles.termsRow}>
          <View
            style={[styles.checkbox, agreed && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
            accessible
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreed }}
            onTouchEnd={() => setAgreed(!agreed)}
          />
          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={isLoading}
          style={styles.btn}
          accessibilityLabel="Create account button"
        />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/(auth)/login">
            <Text style={styles.loginLink}>Sign In</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flexGrow: 1,
    padding: SPACING.xl,
    paddingTop: SPACING.section + SPACING.xxl,
    paddingBottom: SPACING.xxxl,
  },
  header: { marginBottom: SPACING.xl },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.xxxl,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: SPACING.xs,
  },
  subtitle: { color: COLORS.textSecondary },
  strengthContainer: {
    marginTop: -SPACING.md,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  strengthBar: { flex: 1, flexDirection: 'row', gap: 4 },
  strengthSegment: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.medium, width: 44 },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    marginTop: 2,
  },
  termsText: { flex: 1, color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm },
  link: { color: COLORS.primary },
  error: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.sm,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.error + '22',
    padding: SPACING.md,
    borderRadius: 8,
  },
  btn: { marginBottom: SPACING.lg },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { color: COLORS.textSecondary },
  loginLink: { color: COLORS.primary, fontWeight: TYPOGRAPHY.semibold },
});
