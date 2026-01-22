/**
 * Notification Routes
 * /api/notifications
 */

import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { registerTokenSchema, unregisterTokenSchema } from '../validators/notification.validator';

const router = Router();

/**
 * All notification routes require authentication
 */
router.use(authenticate);

router.post('/register', validate(registerTokenSchema), NotificationController.registerToken);
router.post('/unregister', validate(unregisterTokenSchema), NotificationController.unregisterToken);
router.post('/test', NotificationController.sendTestNotification);

export default router;
