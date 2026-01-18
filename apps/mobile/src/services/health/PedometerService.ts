import { Pedometer } from 'expo-sensors';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { differenceInDays, startOfDay, endOfDay, format, parseISO } from 'date-fns';
import { apiClient } from '../../utils/apiClient';

// Define the database name
const DB_NAME = 'habit_tracker_steps.db';

interface StepDataEntry {
  date: string; // YYYY-MM-DD
  steps: number;
  distance: number; // Assuming 0.76 meters per step average
  source: 'pedometer' | 'manual';
  synced: boolean;
}

interface PedometerCheckpoint {
  timestamp: number; // Unix timestamp
  steps: number;
}

class PedometerService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isTracking: boolean = false;
  private currentDaySteps: number = 0;
  private pedometerSubscription: Pedometer.PedometerListener | null = null;
  private lastPedometerSteps: number = 0;
  private dailyStepGoal: number = 10000; // Default goal
  private lastMidnightTimestamp: number = 0;

  constructor() {
    this.initDatabase();
    this.setupDailyReset();
  }

  private async initDatabase() {
    try {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS daily_steps (
          date TEXT PRIMARY KEY NOT NULL,
          steps INTEGER NOT NULL,
          distance REAL NOT NULL,
          source TEXT NOT NULL,
          synced INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS pedometer_checkpoints (
          timestamp INTEGER PRIMARY KEY NOT NULL,
          steps INTEGER NOT NULL
        );
      `);
      console.log('Pedometer database initialized.');
      await this.loadCurrentDaySteps();
    } catch (error) {
      console.error('Error initializing pedometer database:', error);
    }
  }

  private async loadCurrentDaySteps() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const result = await this.db?.getFirstAsync<StepDataEntry>(
      'SELECT steps FROM daily_steps WHERE date = ?',
      [today]
    );
    this.currentDaySteps = result?.steps || 0;
    this.lastMidnightTimestamp = startOfDay(new Date()).getTime();
    console.log(`Loaded ${this.currentDaySteps} steps for today.`);
  }

  private async setupDailyReset() {
    const now = new Date();
    const midnight = endOfDay(now);
    midnight.setDate(midnight.getDate() + 1); // Set to next midnight

    const timeUntilMidnight = midnight.getTime() - now.getTime();

    setTimeout(async () => {
      console.log('Performing daily step reset and sync.');
      await this.saveCurrentDaySteps(); // Save today's final steps
      await this.syncStepsToBackend(); // Sync all unsynced steps
      this.currentDaySteps = 0;
      this.lastPedometerSteps = 0;
      this.lastMidnightTimestamp = startOfDay(new Date()).getTime();
      this.setupDailyReset(); // Schedule next reset
    }, timeUntilMidnight);
  }

  public async isAvailable(): Promise<boolean> {
    const result = await Pedometer.isAvailableAsync();
    return result;
  }

  public async getStepCountAsync(startDate: Date, endDate: Date): Promise<number> {
    const isAvailable = await this.isAvailable();
    if (!isAvailable) {
      console.warn('Pedometer is not available on this device.');
      return 0;
    }

    try {
      const result = await Pedometer.getStepCountAsync(startDate, endDate);
      return result.steps;
    } catch (error) {
      console.error('Error getting step count:', error);
      return 0;
    }
  }

  public watchStepCount(callback: (steps: number) => void): void {
    if (!this.isTracking) {
      this.startTracking();
    }
    // This callback is for external listeners to react to step changes.
    // The internal logic of updating currentDaySteps is handled in the subscription.
    // We can pass currentDaySteps directly, or let the subscriber calculate delta
    // based on their own last known value. For simplicity, we'll pass the current total.
    const internalCallback = () => callback(this.currentDaySteps);
    // There isn't a direct way to add multiple external callbacks to Pedometer.watchStepCount
    // easily without managing a list. For now, we assume one primary external listener.
    // If multiple listeners are needed, a separate event emitter pattern would be better.
    if (this.pedometerSubscription) {
      // If already subscribed, just call the callback with current steps
      internalCallback();
    }
  }

  public async startTracking(): Promise<void> {
    const isAvailable = await this.isAvailable();
    if (!isAvailable) {
      console.warn('Pedometer is not available, cannot start tracking.');
      return;
    }
    if (this.isTracking) {
      console.log('Pedometer already tracking.');
      return;
    }

    this.isTracking = true;
    console.log('Starting pedometer tracking...');

    // Get initial steps since midnight or last checkpoint
    const now = new Date();
    const startOfToday = startOfDay(now);

    try {
      const initialStepsResult = await Pedometer.getStepCountAsync(startOfToday, now);
      this.lastPedometerSteps = initialStepsResult.steps;
      this.currentDaySteps = initialStepsResult.steps; // Initialize with steps already taken today

      // Attempt to restore currentDaySteps from local DB if app restarted mid-day
      const today = format(now, 'yyyy-MM-dd');
      const storedSteps = await this.db?.getFirstAsync<StepDataEntry>(
        'SELECT steps FROM daily_steps WHERE date = ?',
        [today]
      );
      if (storedSteps && storedSteps.steps > this.currentDaySteps) {
        this.currentDaySteps = storedSteps.steps;
      }
    } catch (error) {
      console.error('Error getting initial step count:', error);
      this.lastPedometerSteps = 0;
      this.currentDaySteps = 0;
    }

    this.pedometerSubscription = Pedometer.watchStepCount(result => {
      const nowMs = Date.now();
      const currentDayStartMs = startOfDay(new Date(nowMs)).getTime();

      // If a new day has started since last check
      if (currentDayStartMs > this.lastMidnightTimestamp) {
        console.log('New day detected by pedometer watch, resetting steps.');
        this.saveCurrentDaySteps().then(() => this.syncStepsToBackend());
        this.currentDaySteps = 0;
        this.lastPedometerSteps = result.steps; // New baseline for the new day
        this.lastMidnightTimestamp = currentDayStartMs;
      } else {
        // Calculate delta only if Pedometer result is greater than last known pedometer steps
        // This handles cases where the pedometer might reset or give weird values
        if (result.steps > this.lastPedometerSteps) {
          const delta = result.steps - this.lastPedometerSteps;
          this.currentDaySteps += delta;
        } else if (result.steps < this.lastPedometerSteps && result.steps < this.currentDaySteps) {
          // This can happen on device reboot. Re-evaluate against start of day.
          Pedometer.getStepCountAsync(startOfToday, new Date()).then(recalcResult => {
            this.currentDaySteps = recalcResult.steps;
            this.lastPedometerSteps = recalcResult.steps;
          }).catch(err => console.error('Error recalculating steps after reboot:', err));
        }
        this.lastPedometerSteps = result.steps;
      }

      console.log('Current Day Steps:', this.currentDaySteps);
      // Save checkpoint hourly to handle app restarts
      if (nowMs - (this.db?.getFirstAsync<PedometerCheckpoint>('SELECT MAX(timestamp) as timestamp FROM pedometer_checkpoints')?.timestamp || 0) > 3600 * 1000) {
        this.saveCheckpoint(nowMs, result.steps);
      }
    });

    // Sync every hour in background if app is active
    setInterval(() => this.syncStepsToBackend(), 3600 * 1000);
  }

  public stopTracking(): void {
    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }
    this.isTracking = false;
    console.log('Pedometer tracking stopped.');
    this.saveCurrentDaySteps(); // Save final steps when tracking stops
  }

  public getCurrentDaySteps(): number {
    return this.currentDaySteps;
  }

  public async getDailySteps(date: Date): Promise<StepDataEntry | null> {
    const formattedDate = format(date, 'yyyy-MM-dd');
    try {
      const result = await this.db?.getFirstAsync<StepDataEntry>(
        'SELECT * FROM daily_steps WHERE date = ?',
        [formattedDate]
      );
      return result || null;
    } catch (error) {
      console.error('Error getting daily steps from DB:', error);
      return null;
    }
  }

  private async saveCheckpoint(timestamp: number, steps: number) {
    try {
      await this.db?.runAsync(
        'INSERT OR REPLACE INTO pedometer_checkpoints (timestamp, steps) VALUES (?, ?)',
        [timestamp, steps]
      );
    } catch (error) {
      console.error('Error saving pedometer checkpoint:', error);
    }
  }

  private async saveCurrentDaySteps(): Promise<void> {
    const today = format(new Date(), 'yyyy-MM-dd');
    const distance = this.currentDaySteps * 0.76; // Average stride length in meters
    try {
      await this.db?.runAsync(
        'INSERT OR REPLACE INTO daily_steps (date, steps, distance, source, synced) VALUES (?, ?, ?, ?, ?)',
        [today, this.currentDaySteps, distance, 'pedometer', 0] // Mark as unsynced
      );
      console.log(`Saved ${this.currentDaySteps} steps for ${today} to local DB.`);
    } catch (error) {
      console.error('Error saving current day steps to DB:', error);
    }
  }

  public async syncStepsToBackend(): Promise<void> {
    if (!this.db) {
      console.warn('Database not initialized, cannot sync steps.');
      return;
    }

    try {
      const unsyncedSteps = await this.db.getAllAsync<StepDataEntry>(
        'SELECT * FROM daily_steps WHERE synced = 0'
      );

      if (unsyncedSteps.length === 0) {
        console.log('No unsynced steps to push to backend.');
        return;
      }

      console.log(`Attempting to sync ${unsyncedSteps.length} unsynced step entries...`);

      for (const entry of unsyncedSteps) {
        try {
          // Assuming the backend API expects date in ISO format or similar
          const response = await apiClient.post('/steps', {
            date: entry.date,
            steps: entry.steps,
            distance: entry.distance,
            source: entry.source,
          });
          if (response.status === 200 || response.status === 201) {
            await this.db.runAsync(
              'UPDATE daily_steps SET synced = 1 WHERE date = ?',
              [entry.date]
            );
            console.log(`Successfully synced steps for ${entry.date}.`);
          } else {
            console.error(`Failed to sync steps for ${entry.date}:`, response.data);
          }
        } catch (syncError) {
          console.error(`Error syncing steps for ${entry.date} to backend:`, syncError);
          // Continue to next entry even if one fails
        }
      }
    } catch (error) {
      console.error('Error retrieving unsynced steps from DB:', error);
    }
  }

  public async manuallyLogSteps(date: Date, steps: number, distance: number): Promise<void> {
    const formattedDate = format(date, 'yyyy-MM-dd');
    try {
      await this.db?.runAsync(
        'INSERT OR REPLACE INTO daily_steps (date, steps, distance, source, synced) VALUES (?, ?, ?, ?, ?)',
        [formattedDate, steps, distance, 'manual', 0] // Mark as unsynced
      );
      console.log(`Manually logged ${steps} steps for ${formattedDate}.`);
      await this.syncStepsToBackend();
    } catch (error) {
      console.error('Error manually logging steps:', error);
    }
  }

  // Exposed for components to get the daily step goal
  public getDailyStepGoal(): number {
    return this.dailyStepGoal;
  }

  // Exposed for components to set the daily step goal
  public setDailyStepGoal(goal: number): void {
    this.dailyStepGoal = goal;
    // Potentially save this to AsyncStorage or persistent storage
  }
}

export const pedometerService = new PedometerService();