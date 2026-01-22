/**
 * Login Screen
 * Email and password login with validation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Button, Input } from '../../components/common';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing, typography } from '../../constants/theme';
import { validateEmail } from '@habit-tracker/shared-utils';

export function LoginScreen({ navigation }: any) {
  const { login, isLoggingIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  // Validation
  const errors = {
    email: !validateEmail(email) ? 'Invalid email format' : '',
    password: password.length < 1 ? 'Password is required' : '',
  };

  const isValid = !errors.email && !errors.password && email && password;

  const handleLogin = () => {
    if (!isValid) {
      setTouched({ email: true, password: true });
      return;
    }

    login(
      { email: email.toLowerCase().trim(), password },
      {
        onError: (error: any) => {
          Alert.alert('Login Failed', error.message || 'Please check your credentials');
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to continue tracking your habits</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            onBlur={() => setTouched({ ...touched, email: true })}
            error={errors.email}
            touched={touched.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            onBlur={() => setTouched({ ...touched, password: true })}
            error={errors.password}
            touched={touched.password}
            secureTextEntry
          />

          <Button
            title="Login"
            onPress={handleLogin}
            loading={isLoggingIn}
            disabled={!isValid || isLoggingIn}
            fullWidth
            style={styles.loginButton}
          />

          <Button
            title="Don't have an account? Sign Up"
            onPress={() => navigation.navigate('Register')}
            variant="text"
            style={styles.signupButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: spacing.lg,
  },
  signupButton: {
    marginTop: spacing.md,
  },
});
