import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { syncService } from '../sync/SyncService';
import { SecureStorageService } from '../storage/SecureStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUND_SYNC_TASK = 'background-sync-task';
const LAST_SYNC_KEY = 'last_background_sync';

/**
 * Background task handler for full sync
 * Runs every 4 hours to sync all data
 */
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  console.log('Background sync task started');

  try {
    // Get user
    const user = await SecureStorageService.getUser();
    if (!user?.id) {
      console.log('No user found, skipping background sync');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    const userId = user.id;

    // Perform full sync
    const result = await syncService.performFullSync(userId);

    if (result.success) {
      // Update last sync time
      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

      console.log('Background sync completed successfully', result);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      console.error('Background sync failed:', result.error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  } catch (error) {
    console.error('Background sync task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export class BackgroundSyncTask {
  /**
   * Register background sync task
   * This should be called once when the app starts
   */
  static async register(): Promise<void> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);

      if (!isRegistered) {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
          minimumInterval: 4 * 60 * 60, // 4 hours in seconds
          stopOnTerminate: false, // Continue after app is killed
          startOnBoot: true, // Start after device reboot
        });

        console.log('Background sync task registered successfully');
      } else {
        console.log('Background sync task already registered');
      }
    } catch (error) {
      console.error('Failed to register background sync task:', error);
    }
  }

  /**
   * Unregister background sync task
   */
  static async unregister(): Promise<void> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);

      if (isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
        console.log('Background sync task unregistered');
      }
    } catch (error) {
      console.error('Failed to unregister background sync task:', error);
    }
  }

  /**
   * Check if background sync task is registered
   */
  static async isRegistered(): Promise<boolean> {
    try {
      return await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    } catch (error) {
      console.error('Failed to check background sync task status:', error);
      return false;
    }
  }

  /**
   * Get last sync time
   */
  static async getLastSyncTime(): Promise<Date | null> {
    try {
      const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
      return lastSync ? new Date(lastSync) : null;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  }

  /**
   * Get background fetch status
   */
  static async getStatus(): Promise<BackgroundFetch.BackgroundFetchStatus | null> {
    try {
      return await BackgroundFetch.getStatusAsync();
    } catch (error) {
      console.error('Failed to get background fetch status:', error);
      return null;
    }
  }
}
