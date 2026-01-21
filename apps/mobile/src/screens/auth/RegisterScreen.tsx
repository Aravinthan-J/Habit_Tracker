import React, { useState, useMemo } from 'react';
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
import { colors, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '@habit-tracker/shared-utils';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Ionicons } from '@expo/vector-icons';

/**
 * Register Screen with password validation and requirements
 */
const RegisterScreen = ({ navigation }: any) => {
  const { register, isRegistering } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  // Password requirements validation
  const passwordRequirements = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
    };
  }, [password]);

  const allPasswordRequirementsMet = Object.values(passwordRequirements).every(Boolean);

  // Form validation
  const nameError = nameTouched && name.length < 2 ? 'Name must be at least 2 characters' : '';
  const emailError = emailTouched && !validateEmail(email) ? 'Invalid email address' : '';
  const passwordError =
    passwordTouched && !allPasswordRequirementsMet ? 'Password does not meet requirements' : '';
  const confirmPasswordError =
    confirmPasswordTouched && password !== confirmPassword ? 'Passwords do not match' : '';

  const isFormValid =
    name.length >= 2 &&
    validateEmail(email) &&
    allPasswordRequirementsMet &&
    password === confirmPassword;

  const handleRegister = () => {
    setNameTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    if (!isFormValid) {
      return;
    }

    register(
      { email, password, name },
      {
        onSuccess: () => {
          console.log('Registration successful');
        },
        onError: (error: any) => {
          Alert.alert(
            'Registration Failed',
            error?.response?.data?.message || 'Unable to create account. Please try again.',
            [{ text: 'OK' }]
          );
        },
      }
    );
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start tracking your habits today</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            onBlur={() => setNameTouched(true)}
            error={nameError}
            touched={nameTouched}
            autoCapitalize="words"
            icon="person-outline"
          />

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
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            onBlur={() => setPasswordTouched(true)}
            error={passwordError}
            touched={passwordTouched}
            secureTextEntry
            icon="lock-closed-outline"
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => setConfirmPasswordTouched(true)}
            error={confirmPasswordError}
            touched={confirmPasswordTouched}
            secureTextEntry
            icon="lock-closed-outline"
          />

          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <PasswordRequirement
              text="At least 8 characters"
              met={passwordRequirements.minLength}
            />
            <PasswordRequirement
              text="One uppercase letter"
              met={passwordRequirements.hasUppercase}
            />
            <PasswordRequirement text="One number" met={passwordRequirements.hasNumber} />
          </View>

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isRegistering}
            disabled={!isFormValid || isRegistering}
            fullWidth
            style={styles.registerButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/**
 * Password requirement indicator component
 */
const PasswordRequirement: React.FC<{ text: string; met: boolean }> = ({ text, met }) => (
  <View style={styles.requirementRow}>
    <Ionicons
      name={met ? 'checkmark-circle' : 'ellipse-outline'}
      size={16}
      color={met ? colors.success : colors.textLight}
    />
    <Text style={[styles.requirementText, met && styles.requirementTextMet]}>{text}</Text>
  </View>
);

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
  requirementsContainer: {
    backgroundColor: colors.backgroundDark,
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginBottom: spacing.lg,
  },
  requirementsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  requirementText: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginLeft: spacing.sm,
  },
  requirementTextMet: {
    color: colors.success,
  },
  registerButton: {
    marginBottom: spacing.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default RegisterScreen;
