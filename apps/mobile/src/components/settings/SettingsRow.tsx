import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';
import Icon from 'react-native-vector-icons/Ionicons';

interface SettingsRowProps {
  label: string;
  description?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ label, description, children, onPress, showChevron = false }) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
        {children}
        {showChevron && <Icon name="chevron-forward-outline" size={20} color={colors.text_light} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text_secondary,
    marginTop: spacing.xs,
  },
});

export default SettingsRow;
