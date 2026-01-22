/**
 * Notifications Hook
 * Manages push notifications and permissions
 */

import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useMutation } from '@tanstack/react-query';
import { ExpoNotificationService } from '../services/notifications/ExpoNotificationService';
import { api } from '../services/api/apiClient';

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);

  // Register token with backend
  const registerTokenMutation = useMutation({
    mutationFn: async (token: string) => {
      await api.notifications.registerToken(
        token,
        Platform.OS as 'ios' | 'android',
        Platform.OS
      );
    },
  });

  // Unregister token from backend
  const unregisterTokenMutation = useMutation({
    mutationFn: async (token: string) => {
      await api.notifications.unregisterToken(token);
    },
  });

  /**
   * Request permissions and get push token
   */
  const requestPermissions = async () => {
    try {
      const hasPermission = await ExpoNotificationService.requestPermissions();
      setNotificationPermission(hasPermission);

      if (hasPermission) {
        const token = await ExpoNotificationService.getExpoPushToken();
        if (token) {
          setExpoPushToken(token);
          await registerTokenMutation.mutateAsync(token);
        }
      }

      return hasPermission;
    } catch (error) {
      console.error('Error requesting notifications:', error);
      return false;
    }
  };

  /**
   * Schedule habit reminder
   */
  const scheduleHabitReminder = async (
    habitId: string,
    habitTitle: string,
    hour: number,
    minute: number
  ): Promise<string> => {
    return await ExpoNotificationService.scheduleHabitReminder(
      habitId,
      habitTitle,
      hour,
      minute
    );
  };

  /**
   * Cancel habit reminder
   */
  const cancelHabitReminder = async (notificationId: string) => {
    await ExpoNotificationService.cancelNotification(notificationId);
  };

  /**
   * Send test notification
   */
  const sendTestNotification = async () => {
    await api.notifications.sendTestNotification();
  };

  /**
   * Set badge count
   */
  const setBadgeCount = async (count: number) => {
    await ExpoNotificationService.setBadgeCount(count);
  };

  return {
    expoPushToken,
    notificationPermission,
    requestPermissions,
    scheduleHabitReminder,
    cancelHabitReminder,
    sendTestNotification,
    setBadgeCount,
  };
}

/**
 * Hook to setup notification listeners
 */
export function useNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
) {
  useEffect(() => {
    // Listen for notifications when app is in foreground
    const receivedSubscription = ExpoNotificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        onNotificationReceived?.(notification);
      }
    );

    // Listen for user tapping on notification
    const responseSubscription = ExpoNotificationService.addNotificationResponseListener(
      (response) => {
        console.log('Notification tapped:', response);
        onNotificationTapped?.(response);
      }
    );

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [onNotificationReceived, onNotificationTapped]);
}
