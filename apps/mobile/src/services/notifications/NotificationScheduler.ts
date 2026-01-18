import { notificationService } from './ExpoNotificationService';

class NotificationScheduler {
  public async setupDailyReminder(hour: number, minute: number, incompleteHabitCount: number): Promise<string | undefined> {
    // Before scheduling, ensure to cancel any existing daily reminders to avoid duplicates
    await notificationService.cancelDailyReminder();
    return notificationService.scheduleDailyReminder(hour, minute, incompleteHabitCount);
  }

  public async setupWeeklySummary(): Promise<string | undefined> {
    return notificationService.scheduleWeeklySummary();
  }

  public async scheduleStreakMilestone(daysLeft: number, habitName: string): Promise<string | undefined> {
    return notificationService.scheduleStreakMilestone(daysLeft, habitName);
  }

  public async triggerMissedHabitsAlert(missedCount: number): Promise<string | undefined> {
    return notificationService.sendMissedHabitsAlert(missedCount);
  }

  // This can be expanded to manage all scheduled notifications
  public async cancelAllAppNotifications(): Promise<void> {
    await notificationService.cancelAllScheduledNotifications();
  }

  // Additional methods for managing notification settings (e.g., from a settings screen)
  // These would typically interact with a settings store to persist user preferences.
  public async enableDailyReminders(hour: number, minute: number, incompleteHabitCount: number): Promise<void> {
    // In a real app, incompleteHabitCount would be dynamically fetched
    await this.setupDailyReminder(hour, minute, incompleteHabitCount);
    // save setting to persistent storage
  }

  public async disableDailyReminders(): Promise<void> {
    await notificationService.cancelDailyReminder();
    // save setting to persistent storage
  }

  public async enableWeeklySummary(): Promise<void> {
    await this.setupWeeklySummary();
    // save setting to persistent storage
  }

  public async disableWeeklySummary(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync({ channelId: 'weekly-summaries' });
    // save setting to persistent storage
  }
}

export const notificationScheduler = new NotificationScheduler();
