import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../services/notifications/ExpoNotificationService';

export interface NotificationSettings {
  enabled: boolean;
  dailyReminder: {
    enabled: boolean;
    hour: number;
    minute: number;
  };
  weeklySummary: boolean;
  missedHabitsAlert: boolean;
  badgeUnlock: boolean;
  stepGoal: boolean;
  streakMilestone: boolean;
  quietHours: {
    enabled: boolean;
    start: number;
    end: number;
  };
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  dailyReminder: {
    enabled: true,
    hour: 20,
    minute: 0,
  },
  weeklySummary: true,
  missedHabitsAlert: true,
  badgeUnlock: true,
  stepGoal: true,
  streakMilestone: true,
  quietHours: {
    enabled: false,
    start: 22,
    end: 7,
  },
};

const STORAGE_KEY = 'notification_settings';

interface NotificationState {
  settings: NotificationSettings;
  hasPermission: boolean;
  isLoading: boolean;

  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  requestPermission: () => Promise<boolean>;
  scheduleDailyReminder: (incompleteCount: number) => Promise<void>;
  scheduleWeeklySummary: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  hasPermission: false,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ settings: { ...DEFAULT_SETTINGS, ...parsed } });
      }

      const hasPermission = await notificationService.requestPermissions();
      set({ hasPermission, isLoading: false });
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      set({ isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    const { settings } = get();
    const newSettings = { ...settings, ...updates };

    set({ settings: newSettings });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));

    // Apply settings
    if (!newSettings.enabled) {
      await notificationService.cancelAllScheduledNotifications();
    } else {
      if (newSettings.dailyReminder.enabled) {
        await notificationService.scheduleDailyReminder(
          newSettings.dailyReminder.hour,
          newSettings.dailyReminder.minute,
          0
        );
      } else {
        await notificationService.cancelDailyReminder();
      }

      if (newSettings.weeklySummary) {
        await notificationService.scheduleWeeklySummary();
      }
    }
  },

  requestPermission: async () => {
    const granted = await notificationService.requestPermissions();
    set({ hasPermission: granted });
    return granted;
  },

  scheduleDailyReminder: async (incompleteCount) => {
    const { settings, hasPermission } = get();
    if (!hasPermission || !settings.enabled || !settings.dailyReminder.enabled) {
      return;
    }

    await notificationService.scheduleDailyReminder(
      settings.dailyReminder.hour,
      settings.dailyReminder.minute,
      incompleteCount
    );
  },

  scheduleWeeklySummary: async () => {
    const { settings, hasPermission } = get();
    if (!hasPermission || !settings.enabled || !settings.weeklySummary) {
      return;
    }

    await notificationService.scheduleWeeklySummary();
  },

  cancelAllNotifications: async () => {
    await notificationService.cancelAllScheduledNotifications();
  },

  sendTestNotification: async () => {
    const { hasPermission } = get();
    if (!hasPermission) {
      await get().requestPermission();
    }

    await notificationService.sendBadgeUnlock('Test Badge', 'test-id');
  },
}));
