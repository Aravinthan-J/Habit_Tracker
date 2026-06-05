import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoogleButton } from '@/components/ui/GoogleButton';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { passwordStrength } from '@/utils/validators';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '@/lib/firebase';

WebBrowser.maybeCompleteAuthSession();

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const strength = passwordStrength(password);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) handleGoogleResponse(id_token);
    } else if (response?.type === 'error') {
      setError(response.error?.message ?? 'Google sign-in failed.');
    }
  }, [response]);

  const handleGoogleResponse = async (idToken: string) => {
    setIsGoogleLoading(true);
    setError(null);
    const { error: authError } = await signInWithGoogle(idToken);
    setIsGoogleLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      router.replace('/(tabs)');
    }
  };

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

        {/* Google Sign-Up */}
        <GoogleButton
          onPress={() => { setError(null); promptAsync(); }}
          loading={isGoogleLoading}
          label="Sign up with Google"
        />

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign up with email</Text>
          <View style={styles.dividerLine} />
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
          <View style={styles.strengthWrapper}>
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
            <View style={styles.conditionsGrid}>
              {[
                { label: 'At least 8 characters', met: password.length >= 8 },
                { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
                { label: 'One lowercase letter', met: /[a-z]/.test(password) },
                { label: 'One number', met: /[0-9]/.test(password) },
              ].map(({ label, met }) => (
                <View key={label} style={styles.condition}>
                  <Ionicons
                    name={met ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={met ? COLORS.success : COLORS.textMuted}
                  />
                  <Text style={[styles.conditionText, { color: met ? COLORS.success : COLORS.textMuted }]}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
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
          <TouchableOpacity
            style={[styles.checkbox, agreed && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
            onPress={() => setAgreed(!agreed)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreed }}
            activeOpacity={0.7}
          >
            {agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text style={styles.link} onPress={() => router.push('/terms')}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.link} onPress={() => router.push('/privacy')}>Privacy Policy</Text>
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginVertical: SPACING.xl,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.cardBorder },
  dividerText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.xs },
  strengthWrapper: {
    marginTop: -SPACING.md,
    marginBottom: SPACING.lg,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  strengthBar: { flex: 1, flexDirection: 'row', gap: 4 },
  strengthSegment: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.medium, width: 44 },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    rowGap: SPACING.xs,
  },
  condition: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '48%',
  },
  conditionText: { fontSize: TYPOGRAPHY.xs },
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
