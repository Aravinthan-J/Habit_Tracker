import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail } from '@habit-tracker/shared-utils';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

/**
 * Login Screen with form validation and API integration
 */
const LoginScreen = ({ navigation }: any) => {
  const { login, isLoggingIn, loginError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Validation
  const emailError = emailTouched && !validateEmail(email) ? 'Invalid email address' : '';
  const passwordError = passwordTouched && password.length < 1 ? 'Password is required' : '';
  const isFormValid = validateEmail(email) && password.length > 0;

  const handleLogin = () => {
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!isFormValid) {
      return;
    }

    login(
      { email, password },
      {
        onSuccess: () => {
          // Navigation is handled automatically by the auth state change
          console.log('Login successful');
        },
        onError: (error: any) => {
          Alert.alert(
            'Login Failed',
            error?.response?.data?.message || 'Invalid email or password. Please try again.',
            [{ text: 'OK' }]
          );
        },
      }
    );
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue tracking your habits</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            onBlur={() => setEmailTouched(true)}
            error={emailError}
            touched={emailTouched}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            icon="mail-outline"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            onBlur={() => setPasswordTouched(true)}
            error={passwordError}
            touched={passwordTouched}
            secureTextEntry
            icon="lock-closed-outline"
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Login"
            onPress={handleLogin}
            loading={isLoggingIn}
            disabled={!isFormValid || isLoggingIn}
            fullWidth
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  loginButton: {
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default LoginScreen;
