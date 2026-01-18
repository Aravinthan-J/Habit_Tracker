import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { isSunday } from 'date-fns';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationDetails {
  title: string;
  body: string;
  data?: { [key: string]: any };
  categoryId?: string;
  badge?: number;
}

class ExpoNotificationService {
  constructor() {
    this.setupNotificationChannels();
  }

  private async setupNotificationChannels() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelGroupAsync('habit-reminders', {
        name: 'Habit Reminders',
        importance: Notifications.AndroidNotificationChannelGroupImportance.HIGH,
      });
      await Notifications.setNotificationChannelAsync('daily-reminders', {
        name: 'Daily Reminders',
        importance: Notifications.AndroidNotificationChannelImportance.HIGH,
        sound: 'default',
        vibrationPattern: [250, 250, 250, 250],
        groupId: 'habit-reminders',
      });
      await Notifications.setNotificationChannelAsync('weekly-summaries', {
        name: 'Weekly Summaries',
        importance: Notifications.AndroidNotificationChannelImportance.LOW,
        sound: 'default',
        groupId: 'habit-reminders',
      });
      await Notifications.setNotificationChannelAsync('milestone-alerts', {
        name: 'Milestone Alerts',
        importance: Notifications.AndroidNotificationChannelImportance.HIGH,
        sound: 'default',
        vibrationPattern: [250, 250, 250, 250],
        groupId: 'habit-reminders',
      });
    }
  }

  public async requestPermissions(): Promise<boolean> {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return false;
      }
      return true;
    } else {
      console.log('Must use physical device for Push Notifications');
      return false;
    }
  }

  public async getExpoPushToken(): Promise<string | undefined> {
    const { data } = await Notifications.getExpoPushTokenAsync();
    return data;
  }

  public async scheduleDailyReminder(hour: number, minute: number, incompleteHabitsCount: number): Promise<string | undefined> {
    const permissionsGranted = await this.requestPermissions();
    if (!permissionsGranted) {
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync({ channelId: 'daily-reminders' });

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to check in! 🎯',
        body: `You have ${incompleteHabitsCount} habits to complete today`,
        data: { type: 'daily-reminder', screen: 'home' },
        sound: 'default',
        badge: incompleteHabitsCount > 0 ? incompleteHabitsCount : undefined,
        categoryIdentifier: 'daily-reminder-actions', // For iOS custom actions
      },
      trigger: {
        hour,
        minute,
        repeats: true,
        channelId: 'daily-reminders', // Android channel
      },
    });
    console.log(`Daily reminder scheduled: ${notificationId}`);
    return notificationId;
  }

  public async cancelDailyReminder(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync({ channelId: 'daily-reminders' });
    console.log('Daily reminders cancelled.');
  }

  public async scheduleWeeklySummary(): Promise<string | undefined> {
    const permissionsGranted = await this.requestPermissions();
    if (!permissionsGranted) {
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync({ channelId: 'weekly-summaries' });

    // Schedule for Sunday 8 PM
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Weekly Check-in 📊',
        body: 'Review your habit progress and plan for the week ahead!',
        data: { type: 'weekly-summary', screen: 'analytics' },
        sound: 'default',
      },
      trigger: {
        weekday: 1, // Sunday
        hour: 20,   // 8 PM
        minute: 0,
        repeats: true,
        channelId: 'weekly-summaries', // Android channel
      },
    });
    console.log(`Weekly summary scheduled: ${notificationId}`);
    return notificationId;
  }

  public async sendBadgeUnlock(badgeName: string, badgeId: string): Promise<string> {
    const permissionsGranted = await this.requestPermissions();
    if (!permissionsGranted) {
      return Promise.reject('Permissions not granted');
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🏆 Badge Unlocked: ${badgeName}`,
        body: 'Check out your new achievement!',
        data: { type: 'badge-unlock', badgeId: badgeId, screen: 'badge-detail' },
        sound: 'default',
        vibrate: [0, 250, 250, 250],
      },
      trigger: {
        seconds: 1, // Show immediately
        channelId: 'milestone-alerts',
      },
    });
    console.log(`Badge unlock notification sent: ${notificationId}`);
    return notificationId;
  }

  public async sendStepGoalAchieved(steps: number): Promise<string> {
    const permissionsGranted = await this.requestPermissions();
    if (!permissionsGranted) {
      return Promise.reject('Permissions not granted');
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🚶 Goal Reached! ${steps} steps`,
        body: 'Great job staying active today!',
        data: { type: 'step-goal', screen: 'steps' },
        sound: 'default',
        vibrate: [0, 250, 250, 250],
      },
      trigger: {
        seconds: 1, // Show immediately
        channelId: 'milestone-alerts',
      },
    });
    console.log(`Step goal notification sent: ${notificationId}`);
    return notificationId;
  }

  public async scheduleStreakMilestone(daysLeft: number, habitName: string): Promise<string | undefined> {
    const permissionsGranted = await this.requestPermissions();
    if (!permissionsGranted) {
      return;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔥 Streak Alert for ${habitName}!`,
        body: `Only ${daysLeft} days left to reach your next streak milestone! Keep it up!`,
        data: { type: 'streak-milestone', screen: 'home' },
        sound: 'default',
        vibrate: [0, 250, 250, 250],
      },
      trigger: {
        seconds: 3600 * 24, // Trigger after 24 hours (or customize based on daysLeft logic)
        channelId: 'milestone-alerts',
      },
    });
    console.log(`Streak milestone notification scheduled: ${notificationId}`);
    return notificationId;
  }

  public async sendMissedHabitsAlert(missedCount: number): Promise<string | undefined> {
    const permissionsGranted = await this.requestPermissions();
    if (!permissionsGranted) {
      return;
    }

    if (missedCount === 0) {
      console.log('No missed habits to alert about.');
      return;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'You missed some habits yesterday',
        body: `Don't break your streak! You missed ${missedCount} habits.`,
        data: { type: 'missed-habits', screen: 'home' },
        sound: 'default',
      },
      trigger: {
        hour: 9, // 9 AM
        minute: 0,
        repeats: false, // This should trigger once, if called after midnight for previous day
        channelId: 'daily-reminders',
      },
    });
    console.log(`Missed habits alert scheduled: ${notificationId}`);
    return notificationId;
  }

  public async cancelAllScheduledNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All scheduled notifications cancelled.');
  }

  // iOS-specific: Set up notification categories for actions
  public async setNotificationCategories(): Promise<void> {
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync('daily-reminder-actions', [
        {
          identifier: 'snooze',
          buttonTitle: 'Snooze 1 hour',
          options: {
            isDestructive: false,
            isForeground: false,
          },
        },
        {
          identifier: 'open-app',
          buttonTitle: 'Open App',
          options: {
            isDestructive: false,
            isForeground: true,
          },
        },
      ]);
    }
  }
}

export const notificationService = new ExpoNotificationService();