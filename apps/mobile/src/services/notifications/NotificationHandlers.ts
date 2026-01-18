import * as Notifications from 'expo-notifications';
import { notificationService } from './ExpoNotificationService';

// Define a type for the navigation function provided by the app
type NavigationFunction = (path: string, params?: Record<string, any>) => void;

let navigate: NavigationFunction | null = null;

export const setNavigationFunction = (navFn: NavigationFunction) => {
  navigate = navFn;
};

export const registerNotificationHandlers = () => {
  // Handles notifications received while the app is foregrounded
  Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received in foreground:', notification);
    // You can customize how foreground notifications are handled (e.g., show in-app banner)
  });

  // Handles notification responses (user taps on a notification, or interacts with actions)
  Notifications.addNotificationResponseReceivedListener(response => {
    const { actionIdentifier } = response.action;
    const { data } = response.notification.request.content;

    console.log('Notification response received:', response);
    console.log('Action Identifier:', actionIdentifier);
    console.log('Notification Data:', data);

    if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      // User tapped on the notification itself
      if (navigate && data?.screen) {
        let path = '';
        const params: Record<string, any> = {};

        switch (data.type) {
          case 'daily-reminder':
            path = '/'; // Navigate to home screen
            break;
          case 'weekly-summary':
            path = '/analytics'; // Navigate to analytics screen
            break;
          case 'badge-unlock':
            path = `/badge/${data.badgeId}`; // Navigate to badge detail
            params.id = data.badgeId;
            break;
          case 'step-goal':
            path = '/steps'; // Navigate to steps screen
            break;
          case 'missed-habits':
            path = '/'; // Navigate to home screen
            break;
          default:
            path = '/'; // Default to home screen
            break;
        }

        if (path) {
          navigate(path, params);
        }
      }
    } else if (actionIdentifier === 'snooze') {
      // Handle snooze action (e.g., reschedule the daily reminder)
      // This will require fetching the incomplete habit count.
      // For now, we'll just log it. A real implementation would need to
      // interact with the habit store to get the count.
      console.log('Snooze action triggered. Rescheduling reminder for 1 hour later.');
      // Example: notificationService.scheduleDailyReminder(new Date().getHours() + 1, new Date().getMinutes(), incompleteHabitCount);
    } else if (actionIdentifier === 'open-app') {
      // This action might be redundant with DEFAULT_ACTION_IDENTIFIER if it just opens the app
      console.log('Open App action triggered.');
      if (navigate && data?.screen) {
        navigate('/'); // Or a specific screen based on data
      }
    }
    // Add other custom action handlers here
  });
};

// Optional: unregister handlers on app unmount if needed
export const unregisterNotificationHandlers = () => {
  Notifications.removeAllNotificationListeners();
};
