import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Button, Alert } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';
import { useSteps } from '../../hooks/useSteps';
import { useStepStore } from '../../store/stepStore';
import { notificationService } from '../../services/notifications/ExpoNotificationService';
import SettingsSection from '../../components/settings/SettingsSection';
import SettingsRow from '../../components/settings/SettingsRow';
import Slider from '@react-native-community/slider';

const SettingsScreen = () => {
  const { dailyStepGoal, setDailyStepGoal } = useStepStore();
  const { isPedometerAvailable } = useSteps();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleExport = (format: 'CSV' | 'JSON') => {
    Alert.alert('Export Data', `Exporting data as ${format}...`);
    // In a real app, this would trigger a file export.
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <SettingsSection title="Step Tracking">
        <SettingsRow label="Pedometer" description={isPedometerAvailable ? 'Available' : 'Not available'} />
        <SettingsRow label="Daily Step Goal">
          <Text>{dailyStepGoal.toLocaleString()}</Text>
        </SettingsRow>
        <Slider
          style={{width: '100%', height: 40}}
          minimumValue={1000}
          maximumValue={50000}
          step={1000}
          value={dailyStepGoal}
          onSlidingComplete={setDailyStepGoal}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor={colors.primary}
        />
        <Button title="Sync Now" onPress={() => pedometerService.syncStepsToBackend()} color={colors.primary} />
      </SettingsSection>

      <SettingsSection title="Notifications">
        <SettingsRow label="Enable Notifications">
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
        </SettingsRow>
        {/* Add more granular notification settings here */}
      </SettingsSection>

      <SettingsSection title="Data Management">
        <SettingsRow label="Export Data" showChevron onPress={() => Alert.alert('Export Options', 'Choose a format', [
          { text: 'CSV', onPress: () => handleExport('CSV') },
          { text: 'JSON', onPress: () => handleExport('JSON') },
          { text: 'Cancel', style: 'cancel' }
        ])}/>
        <SettingsRow label="Import Data" showChevron onPress={() => Alert.alert('Import Data', 'Importing data...')}/>
        <SettingsRow label="Clear Cache" showChevron onPress={() => Alert.alert('Clear Cache', 'Cache cleared.')}/>
        <SettingsRow label="Delete Account" showChevron onPress={() => Alert.alert('Delete Account', 'Are you sure? This action is irreversible.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive' }
        ])}/>
      </SettingsSection>
      
      <SettingsSection title="About">
        <SettingsRow label="App Version" description="2.0.0" />
        <SettingsRow label="Privacy Policy" showChevron onPress={() => {}}/>
        <SettingsRow label="Terms of Service" showChevron onPress={() => {}}/>
        <SettingsRow label="Contact Support" showChevron onPress={() => {}}/>
        <SettingsRow label="Rate App" showChevron onPress={() => {}}/>
      </SettingsSection>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    padding: spacing.lg,
  },
});

export default SettingsScreen;
