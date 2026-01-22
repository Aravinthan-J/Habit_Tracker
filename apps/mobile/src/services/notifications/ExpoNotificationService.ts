/**
 * Expo Notification Service
 * Handles Expo push notifications setup and management
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class ExpoNotificationService {
  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }

    return true;
  }

  /**
   * Get Expo push token
   */
  static async getExpoPushToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Get project ID from Expo Constants (set when linked to Expo account via EAS)
      // Falls back to undefined if not set, which Expo will handle automatically
      const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
      const projectId = extra?.eas?.projectId;

      const token = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Schedule a local notification
   */
  static async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: Date | number,
    data?: Record<string, any>
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger:
        typeof trigger === 'number'
          ? { seconds: trigger }
          : { date: trigger },
    });
  }

  /**
   * Schedule daily habit reminder
   */
  static async scheduleHabitReminder(
    habitId: string,
    habitTitle: string,
    hour: number,
    minute: number
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time for ${habitTitle}! ⏰`,
        body: `Don't forget to complete your habit today`,
        data: {
          type: 'habit_reminder',
          habitId,
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  }

  /**
   * Cancel scheduled notification
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get all scheduled notifications
   */
  static async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Add notification received listener
   */
  static addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  static addNotificationResponseListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Set badge count
   */
  static async setBadgeCount(count: number): Promise<boolean> {
    return await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Get badge count
   */
  static async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }
}
