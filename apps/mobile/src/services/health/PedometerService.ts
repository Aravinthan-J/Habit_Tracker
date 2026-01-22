/**
 * Pedometer Service
 * Handles step counting using device's pedometer
 */

import { Pedometer } from 'expo-sensors';

export class PedometerService {
  /**
   * Check if pedometer is available on device
   */
  static async isAvailable(): Promise<boolean> {
    return await Pedometer.isAvailableAsync();
  }

  /**
   * Get step count for today
   */
  static async getTodayStepCount(): Promise<number> {
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    try {
      const result = await Pedometer.getStepCountAsync(start, end);
      return result.steps;
    } catch (error) {
      console.error('Error getting step count:', error);
      return 0;
    }
  }

  /**
   * Get step count for specific date range
   */
  static async getStepCount(startDate: Date, endDate: Date): Promise<number> {
    try {
      const result = await Pedometer.getStepCountAsync(startDate, endDate);
      return result.steps;
    } catch (error) {
      console.error('Error getting step count:', error);
      return 0;
    }
  }

  /**
   * Subscribe to step count updates
   * Returns unsubscribe function
   */
  static watchStepCount(callback: (stepCount: number) => void): () => void {
    const subscription = Pedometer.watchStepCount((result) => {
      callback(result.steps);
    });

    return () => {
      subscription.remove();
    };
  }

  /**
   * Request pedometer permissions (iOS specific)
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Pedometer.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting pedometer permissions:', error);
      return false;
    }
  }

  /**
   * Get permissions status
   */
  static async getPermissionsStatus(): Promise<string> {
    try {
      const { status } = await Pedometer.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Error getting permissions status:', error);
      return 'undetermined';
    }
  }

  /**
   * Calculate distance from steps (average stride length)
   */
  static calculateDistance(steps: number, strideLength: number = 0.78): number {
    // Default stride length is 0.78 meters (average for adults)
    // Distance in kilometers
    return (steps * strideLength) / 1000;
  }

  /**
   * Calculate calories burned from steps (rough estimate)
   */
  static calculateCalories(steps: number, weight: number = 70): number {
    // Rough estimate: 0.04 calories per step per kg
    return Math.round(steps * 0.04 * (weight / 70));
  }

  /**
   * Calculate active minutes from steps (rough estimate)
   */
  static calculateActiveMinutes(steps: number): number {
    // Rough estimate: 100 steps per minute of walking
    return Math.round(steps / 100);
  }
}
