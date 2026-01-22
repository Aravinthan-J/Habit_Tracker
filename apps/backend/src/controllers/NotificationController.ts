/**
 * Notification Controller
 * Handles notification-related operations
 */

import { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess, sendCreated } from '../utils/response';

export class NotificationController {
  /**
   * POST /api/notifications/register
   * Register push notification token
   */
  static registerToken = catchAsync(async (req: Request, res: Response) => {
    const { token, platform, deviceId } = req.body;

    await NotificationService.registerToken(req.user!.id, token, platform, deviceId);

    sendCreated(res, {}, 'Notification token registered successfully');
  });

  /**
   * POST /api/notifications/unregister
   * Remove push notification token
   */
  static unregisterToken = catchAsync(async (req: Request, res: Response) => {
    const { token } = req.body;

    await NotificationService.removeToken(token);

    sendSuccess(res, {}, 'Notification token removed successfully');
  });

  /**
   * POST /api/notifications/test
   * Send test notification to user
   */
  static sendTestNotification = catchAsync(async (req: Request, res: Response) => {
    await NotificationService.sendToUser(req.user!.id, {
      title: 'Test Notification',
      body: 'This is a test notification from Habit Tracker',
      data: { type: 'test' },
    });

    sendSuccess(res, {}, 'Test notification sent successfully');
  });
}
