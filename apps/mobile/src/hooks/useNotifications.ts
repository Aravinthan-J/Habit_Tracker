import { useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { useNotificationStore } from '../store/notificationStore';

/**
 * Hook for managing notifications and handling notification interactions
 */
export function useNotifications() {
  const navigation = useNavigation<any>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const {
    settings,
    hasPermission,
    isLoading,
    loadSettings,
    updateSettings,
    requestPermission,
    scheduleDailyReminder,
    scheduleWeeklySummary,
    cancelAllNotifications,
    sendTestNotification,
  } = useNotificationStore();

  // Initialize on mount
  useEffect(() => {
    loadSettings();

    // Listen for incoming notifications while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    // Listen for notification responses (user tapped notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handleNotificationResponse(response);
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;
      const actionIdentifier = response.actionIdentifier;

      // Handle custom actions
      if (actionIdentifier === 'snooze') {
        // Reschedule notification for 1 hour later
        const now = new Date();
        now.setHours(now.getHours() + 1);
        scheduleDailyReminder(0); // Re-schedule
        return;
      }

      // Navigate based on notification type
      if (data?.screen) {
        switch (data.screen) {
          case 'home':
            navigation.navigate('Home');
            break;
          case 'analytics':
            navigation.navigate('Analytics');
            break;
          case 'badges':
            navigation.navigate('Badges');
            break;
          case 'badge-detail':
            if (data.badgeId) {
              navigation.navigate('BadgeDetail', { badgeId: data.badgeId });
            }
            break;
          case 'steps':
            navigation.navigate('Steps');
            break;
          default:
            navigation.navigate('Home');
        }
      }
    },
    [navigation, scheduleDailyReminder]
  );

  const enableNotifications = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      await updateSettings({ enabled: true });
      if (settings.dailyReminder.enabled) {
        await scheduleDailyReminder(0);
      }
      if (settings.weeklySummary) {
        await scheduleWeeklySummary();
      }
    }
    return granted;
  }, [requestPermission, updateSettings, settings, scheduleDailyReminder, scheduleWeeklySummary]);

  const disableNotifications = useCallback(async () => {
    await updateSettings({ enabled: false });
    await cancelAllNotifications();
  }, [updateSettings, cancelAllNotifications]);

  const setDailyReminderTime = useCallback(async (hour: number, minute: number) => {
    await updateSettings({
      dailyReminder: {
        ...settings.dailyReminder,
        hour,
        minute,
      },
    });
  }, [updateSettings, settings.dailyReminder]);

  const toggleDailyReminder = useCallback(async (enabled: boolean) => {
    await updateSettings({
      dailyReminder: {
        ...settings.dailyReminder,
        enabled,
      },
    });
  }, [updateSettings, settings.dailyReminder]);

  const toggleWeeklySummary = useCallback(async (enabled: boolean) => {
    await updateSettings({ weeklySummary: enabled });
  }, [updateSettings]);

  const toggleBadgeNotifications = useCallback(async (enabled: boolean) => {
    await updateSettings({ badgeUnlock: enabled });
  }, [updateSettings]);

  const toggleStepNotifications = useCallback(async (enabled: boolean) => {
    await updateSettings({ stepGoal: enabled });
  }, [updateSettings]);

  return {
    settings,
    hasPermission,
    isLoading,
    enableNotifications,
    disableNotifications,
    setDailyReminderTime,
    toggleDailyReminder,
    toggleWeeklySummary,
    toggleBadgeNotifications,
    toggleStepNotifications,
    sendTestNotification,
    updateSettings,
  };
}
