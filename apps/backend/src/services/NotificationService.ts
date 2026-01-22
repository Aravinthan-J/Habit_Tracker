/**
 * Notification Service
 * Handles push notifications via Expo Push Notification Service
 */

import { PrismaClient } from '@prisma/client';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

const prisma = new PrismaClient();
const expo = new Expo();

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  priority?: 'default' | 'normal' | 'high';
}

export class NotificationService {
  /**
   * Register push notification token
   */
  static async registerToken(
    userId: string,
    token: string,
    platform: string,
    deviceId?: string
  ): Promise<void> {
    // Validate Expo push token
    if (!Expo.isExpoPushToken(token)) {
      throw new Error('Invalid Expo push token');
    }

    // Upsert token (update if exists, create if not)
    await prisma.notificationToken.upsert({
      where: { token },
      update: {
        userId,
        platform,
        deviceId,
        updatedAt: new Date(),
      },
      create: {
        userId,
        token,
        platform,
        deviceId,
      },
    });
  }

  /**
   * Remove push notification token
   */
  static async removeToken(token: string): Promise<void> {
    await prisma.notificationToken.delete({
      where: { token },
    });
  }

  /**
   * Get user's push tokens
   */
  static async getUserTokens(userId: string): Promise<string[]> {
    const tokens = await prisma.notificationToken.findMany({
      where: { userId },
      select: { token: true },
    });

    return tokens.map((t) => t.token);
  }

  /**
   * Send notification to specific user
   */
  static async sendToUser(
    userId: string,
    notification: NotificationPayload
  ): Promise<void> {
    const tokens = await this.getUserTokens(userId);

    if (tokens.length === 0) {
      console.log(`No push tokens found for user ${userId}`);
      return;
    }

    await this.sendToTokens(tokens, notification);
  }

  /**
   * Send notification to multiple tokens
   */
  static async sendToTokens(
    tokens: string[],
    notification: NotificationPayload
  ): Promise<void> {
    const messages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      badge: notification.badge,
      sound: notification.sound || 'default',
      priority: notification.priority || 'high',
    }));

    // Chunk messages for Expo API limits
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notifications:', error);
      }
    }

    // Handle tickets with errors
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      if (ticket.status === 'error') {
        console.error(`Error sending notification to ${tokens[i]}:`, ticket.message);

        // If token is invalid, remove it
        if (ticket.details?.error === 'DeviceNotRegistered') {
          await this.removeToken(tokens[i]);
        }
      }
    }
  }

  /**
   * Send habit reminder notification
   */
  static async sendHabitReminder(
    userId: string,
    habitTitle: string,
    habitId: string
  ): Promise<void> {
    await this.sendToUser(userId, {
      title: `Time for ${habitTitle}! ⏰`,
      body: `Don't forget to complete your habit today`,
      data: {
        type: 'habit_reminder',
        habitId,
      },
      badge: 1,
    });
  }

  /**
   * Send badge unlock notification
   */
  static async sendBadgeUnlock(
    userId: string,
    badgeName: string,
    badgeIcon: string
  ): Promise<void> {
    await this.sendToUser(userId, {
      title: `Badge Unlocked! 🎉`,
      body: `You earned the "${badgeName}" badge ${badgeIcon}`,
      data: {
        type: 'badge_unlock',
        badgeName,
      },
      badge: 1,
    });
  }

  /**
   * Send streak milestone notification
   */
  static async sendStreakMilestone(
    userId: string,
    habitTitle: string,
    streakDays: number
  ): Promise<void> {
    await this.sendToUser(userId, {
      title: `${streakDays}-Day Streak! 🔥`,
      body: `You've maintained a ${streakDays}-day streak on "${habitTitle}"`,
      data: {
        type: 'streak_milestone',
        habitTitle,
        streakDays,
      },
      badge: 1,
    });
  }

  /**
   * Send daily summary notification
   */
  static async sendDailySummary(
    userId: string,
    completedCount: number,
    totalCount: number
  ): Promise<void> {
    const completionRate = Math.round((completedCount / totalCount) * 100);
    let emoji = '📊';
    let message = `You completed ${completedCount}/${totalCount} habits today`;

    if (completionRate === 100) {
      emoji = '🎉';
      message = `Perfect day! You completed all ${totalCount} habits!`;
    } else if (completionRate >= 75) {
      emoji = '⭐';
      message = `Great job! ${completedCount}/${totalCount} habits completed`;
    }

    await this.sendToUser(userId, {
      title: `Daily Summary ${emoji}`,
      body: message,
      data: {
        type: 'daily_summary',
        completedCount,
        totalCount,
        completionRate,
      },
    });
  }

  /**
   * Schedule habit reminders for all users
   * Called by a cron job or scheduler
   */
  static async scheduleHabitReminders(): Promise<void> {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Find habits with reminders at current time
    const habits = await prisma.habit.findMany({
      where: {
        notificationsEnabled: true,
        reminderTime: currentTime,
        archivedAt: null,
      },
      include: {
        user: true,
      },
    });

    // Check if habit was already completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const habit of habits) {
      const completion = await prisma.completion.findUnique({
        where: {
          habitId_date: {
            habitId: habit.id,
            date: today,
          },
        },
      });

      // Only send reminder if not completed
      if (!completion) {
        await this.sendHabitReminder(habit.userId, habit.title, habit.id);
      }
    }
  }

  /**
   * Send daily summaries to all users
   */
  static async sendDailySummaries(): Promise<void> {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      include: {
        habits: {
          where: { archivedAt: null },
        },
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const user of users) {
      if (user.habits.length === 0) continue;

      const completedCount = await prisma.completion.count({
        where: {
          userId: user.id,
          date: today,
        },
      });

      await this.sendDailySummary(user.id, completedCount, user.habits.length);
    }
  }
}
