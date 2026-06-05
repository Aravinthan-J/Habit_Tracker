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
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoogleButton } from '@/components/ui/GoogleButton';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '@/lib/firebase';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

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

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    try {
      const { error: authError } = await signIn(email.trim(), password);
      if (authError) {
        setError(authError.message);
      } else {
        router.replace('/(tabs)');
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
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#FF6B6B', '#A855F7', '#6C63FF', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoCircle}
          >
            <Text style={styles.logoText}>H</Text>
          </LinearGradient>
          <Text style={styles.appName}>Habity</Text>
          <Text style={styles.tagline}>Your future self is watching.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          {/* Google Sign-In */}
          <GoogleButton
            onPress={() => { setError(null); promptAsync(); }}
            loading={isGoogleLoading}
            label="Continue with Google"
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

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
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon="lock-closed-outline"
            accessibilityLabel="Password input"
            autoComplete="password"
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={styles.forgotRow} accessibilityLabel="Forgot password">
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginBtn}
          />

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <Link href="/(auth)/register">
              <Text style={styles.registerLink}>Sign Up</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
    paddingTop: SPACING.xxxl,
  },
  header: { alignItems: 'center', marginBottom: SPACING.xxxl },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoText: { color: COLORS.textPrimary, fontSize: 40, fontWeight: TYPOGRAPHY.bold },
  appName: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.xxxl,
    fontWeight: TYPOGRAPHY.extrabold,
    letterSpacing: 1,
  },
  tagline: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.md, marginTop: SPACING.xs },
  form: {},
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: SPACING.xs,
  },
  subtitle: { color: COLORS.textSecondary, marginBottom: SPACING.xl },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginVertical: SPACING.xl,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.cardBorder },
  dividerText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sm },
  error: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.sm,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.error + '22',
    padding: SPACING.md,
    borderRadius: 8,
  },
  forgotRow: { alignSelf: 'flex-end', marginBottom: SPACING.lg },
  forgotText: { color: COLORS.primary, fontSize: TYPOGRAPHY.sm },
  loginBtn: { marginBottom: SPACING.lg },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { color: COLORS.textSecondary },
  registerLink: { color: COLORS.primary, fontWeight: TYPOGRAPHY.semibold },
});
