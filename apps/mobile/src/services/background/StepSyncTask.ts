import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { PedometerService } from '../../services/health/PedometerService';
import { StepRepository } from '../database/repositories/StepRepository';
import { syncService } from '../sync/SyncService';
import { networkMonitor } from '../sync/NetworkMonitor';
import { SecureStorageService } from '../storage/SecureStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STEP_SYNC_TASK = 'step-sync-task';
const LAST_STEP_SYNC_KEY = 'last_step_sync';

/**
 * Background task handler for step sync
 * Runs every hour to sync pedometer steps
 */
TaskManager.defineTask(STEP_SYNC_TASK, async () => {
  console.log('Step sync task started');

  try {
    // Get user
    const user = await SecureStorageService.getUser();
    if (!user?.id) {
      console.log('No user found, skipping step sync');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    const userId = user.id;

    // Check if pedometer is available
    const isAvailable = await PedometerService.isAvailable();
    if (!isAvailable) {
      console.log('Pedometer not available, skipping step sync');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Get today's step count from pedometer
    const steps = await PedometerService.getTodayStepCount();
    const distance = PedometerService.calculateDistance(steps);
    const calories = PedometerService.calculateCalories(steps);

    console.log('Current step count:', { steps, distance, calories });

    // Save to local database
    await StepRepository.upsertToday(userId, steps, distance, calories);

    // Sync to server if online
    if (networkMonitor.isConnected()) {
      await syncService.syncStepsToServer(userId);
      console.log('Steps synced to server');
    } else {
      console.log('Offline - steps saved locally, will sync when online');
    }

    // Update last sync time
    await AsyncStorage.setItem(LAST_STEP_SYNC_KEY, new Date().toISOString());

    console.log('Step sync completed successfully');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Step sync task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export class StepSyncTask {
  /**
   * Register step sync task
   * This should be called once when the app starts
   */
  static async register(): Promise<void> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(STEP_SYNC_TASK);

      if (!isRegistered) {
        await BackgroundFetch.registerTaskAsync(STEP_SYNC_TASK, {
          minimumInterval: 60 * 60, // 1 hour in seconds
          stopOnTerminate: false, // Continue after app is killed
          startOnBoot: true, // Start after device reboot
        });

        console.log('Step sync task registered successfully');
      } else {
        console.log('Step sync task already registered');
      }
    } catch (error) {
      console.error('Failed to register step sync task:', error);
    }
  }

  /**
   * Unregister step sync task
   */
  static async unregister(): Promise<void> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(STEP_SYNC_TASK);

      if (isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(STEP_SYNC_TASK);
        console.log('Step sync task unregistered');
      }
    } catch (error) {
      console.error('Failed to unregister step sync task:', error);
    }
  }

  /**
   * Check if step sync task is registered
   */
  static async isRegistered(): Promise<boolean> {
    try {
      return await TaskManager.isTaskRegisteredAsync(STEP_SYNC_TASK);
    } catch (error) {
      console.error('Failed to check step sync task status:', error);
      return false;
    }
  }

  /**
   * Get last step sync time
   */
  static async getLastSyncTime(): Promise<Date | null> {
    try {
      const lastSync = await AsyncStorage.getItem(LAST_STEP_SYNC_KEY);
      return lastSync ? new Date(lastSync) : null;
    } catch (error) {
      console.error('Failed to get last step sync time:', error);
      return null;
    }
  }

  /**
   * Manually trigger step sync
   */
  static async syncNow(userId: string): Promise<void> {
    try {
      console.log('Manual step sync triggered');

      // Check if pedometer is available
      const isAvailable = await PedometerService.isAvailable();
      if (!isAvailable) {
        console.log('Pedometer not available');
        return;
      }

      // Get today's step count
      const steps = await PedometerService.getTodayStepCount();
      const distance = PedometerService.calculateDistance(steps);
      const calories = PedometerService.calculateCalories(steps);

      // Save to local database
      await StepRepository.upsertToday(userId, steps, distance, calories);

      // Sync to server if online
      if (networkMonitor.isConnected()) {
        await syncService.syncStepsToServer(userId);
        console.log('Steps synced to server');
      }

      // Update last sync time
      await AsyncStorage.setItem(LAST_STEP_SYNC_KEY, new Date().toISOString());

      console.log('Manual step sync completed');
    } catch (error) {
      console.error('Manual step sync failed:', error);
      throw error;
    }
  }
}
