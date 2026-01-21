import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  touched?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  containerStyle?: any;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  touched,
  icon,
  secureTextEntry,
  containerStyle,
  ...textInputProps
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasError = touched && error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={hasError ? colors.error : colors.textSecondary}
            style={styles.icon}
          />
        )}

        <TextInput
          style={[styles.input, icon && styles.inputWithIcon]}
          placeholderTextColor={colors.textLight}
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  inputWithIcon: {
    paddingLeft: spacing.xs,
  },
  icon: {
    marginRight: spacing.xs,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});

export default Input;
