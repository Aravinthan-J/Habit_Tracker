import { api } from '../api/apiClient';
import { databaseService } from '../database/DatabaseService';
import { HabitRepository } from '../database/repositories/HabitRepository';
import { CompletionRepository } from '../database/repositories/CompletionRepository';
import { StepRepository } from '../database/repositories/StepRepository';
import { SyncQueueRepository } from '../database/repositories/SyncQueueRepository';
import { ConflictResolver } from './ConflictResolver';
import { networkMonitor } from './NetworkMonitor';
import type { Habit, Completion } from '@habit-tracker/shared-types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MIGRATION_KEY = 'initial_data_migration_complete';

export interface SyncResult {
  success: boolean;
  error?: string;
  synced: {
    habits: number;
    completions: number;
    steps: number;
  };
}

class SyncService {
  private isSyncing = false;
  private syncPromise: Promise<SyncResult> | null = null;

  /**
   * Main sync orchestrator - performs bidirectional sync
   */
  async performFullSync(userId: string): Promise<SyncResult> {
    // If already syncing, return the existing promise
    if (this.isSyncing && this.syncPromise) {
      console.log('Sync already in progress, waiting...');
      return this.syncPromise;
    }

    // Check network connection
    if (!networkMonitor.isConnected()) {
      console.log('No network connection, skipping sync');
      return {
        success: false,
        error: 'No network connection',
        synced: { habits: 0, completions: 0, steps: 0 },
      };
    }

    this.isSyncing = true;
    this.syncPromise = this.executeSyncOperations(userId);

    try {
      const result = await this.syncPromise;
      return result;
    } finally {
      this.isSyncing = false;
      this.syncPromise = null;
    }
  }

  private async executeSyncOperations(userId: string): Promise<SyncResult> {
    console.log('Starting full sync...');
    const result: SyncResult = {
      success: true,
      synced: { habits: 0, completions: 0, steps: 0 },
    };

    try {
      // Check if initial migration is needed
      const migrationComplete = await AsyncStorage.getItem(MIGRATION_KEY);
      if (!migrationComplete) {
        await this.performInitialMigration(userId);
      }

      // Step 1: Push local changes to server (upload)
      await this.pushLocalChanges(userId, result);

      // Step 2: Pull server changes to local (download)
      await this.pullServerData(userId, result);

      // Step 3: Process sync queue (retry failed operations)
      await this.processSyncQueue(userId);

      console.log('Full sync completed successfully', result);
    } catch (error: any) {
      console.error('Sync failed:', error);
      result.success = false;
      result.error = error.message;
    }

    return result;
  }

  /**
   * Initial data migration from server to local DB
   */
  private async performInitialMigration(userId: string): Promise<void> {
    console.log('Performing initial data migration from server...');

    try {
      // Fetch all data from server
      const [habits, completions, steps] = await Promise.all([
        api.habits.getAll(false),
        api.completions.getAll(),
        this.fetchRecentSteps(),
      ]);

      // Store in local database
      await databaseService.transaction(async () => {
        // Import habits
        for (const habit of habits) {
          await HabitRepository.upsert(habit, 'synced');
        }

        // Import completions
        for (const completion of completions) {
          await CompletionRepository.upsert(
            {
              id: completion.id,
              habitId: completion.habitId,
              userId: completion.userId,
              date: completion.date,
              completedAt: completion.completedAt,
            },
            'synced'
          );
        }

        // Import steps
        for (const stepData of steps) {
          await StepRepository.upsert(
            userId,
            stepData.date,
            stepData.steps,
            stepData.distance,
            stepData.calories || 0
          );
          await StepRepository.markAsSynced(userId, stepData.date);
        }
      });

      // Mark migration as complete
      await AsyncStorage.setItem(MIGRATION_KEY, 'true');
      console.log('Initial migration completed successfully');
    } catch (error) {
      console.error('Initial migration failed:', error);
      throw error;
    }
  }

  private async fetchRecentSteps(): Promise<any[]> {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const startDate = thirtyDaysAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      return await api.steps.getSteps(startDate, endDate);
    } catch (error) {
      console.error('Failed to fetch recent steps:', error);
      return [];
    }
  }

  /**
   * Push local changes to server
   */
  private async pushLocalChanges(userId: string, result: SyncResult): Promise<void> {
    console.log('Pushing local changes to server...');

    // Push habits
    const pendingHabits = await HabitRepository.getPendingSync();
    for (const habit of pendingHabits) {
      try {
        // Determine if this is create or update based on whether it exists on server
        const serverHabit = await this.fetchHabitFromServer(habit.id);

        if (!serverHabit) {
          // Create new habit
          await api.habits.create({
            title: habit.title,
            monthlyGoal: habit.monthlyGoal,
            color: habit.color,
            icon: habit.icon || undefined,
            notificationsEnabled: habit.notificationsEnabled,
            reminderTime: habit.reminderTime || undefined,
          });
        } else {
          // Update existing habit
          await api.habits.update(habit.id, {
            title: habit.title,
            color: habit.color,
            icon: habit.icon || undefined,
            notificationsEnabled: habit.notificationsEnabled,
            reminderTime: habit.reminderTime || undefined,
          });
        }

        await HabitRepository.markAsSynced(habit.id);
        result.synced.habits++;
      } catch (error) {
        console.error(`Failed to push habit ${habit.id}:`, error);
        await HabitRepository.markAsError(habit.id);
      }
    }

    // Push completions
    const pendingCompletions = await CompletionRepository.getPendingSync();
    for (const completion of pendingCompletions) {
      try {
        await api.completions.create({
          habitId: completion.habitId,
          date: completion.date,
        });
        await CompletionRepository.markAsSynced(completion.id);
        result.synced.completions++;
      } catch (error) {
        console.error(`Failed to push completion ${completion.id}:`, error);
      }
    }

    // Push steps
    const pendingSteps = await StepRepository.getPendingSync(userId);
    for (const stepData of pendingSteps) {
      try {
        await api.steps.logSteps({
          date: stepData.date,
          steps: stepData.steps,
          distance: stepData.distance,
          calories: stepData.calories,
          source: 'pedometer',
        });
        await StepRepository.markAsSynced(userId, stepData.date);
        result.synced.steps++;
      } catch (error) {
        console.error(`Failed to push steps for ${stepData.date}:`, error);
      }
    }
  }

  /**
   * Pull server data to local
   */
  private async pullServerData(userId: string, result: SyncResult): Promise<void> {
    console.log('Pulling server data to local...');

    try {
      // Fetch all data from server
      const [serverHabits, serverCompletions, serverSteps] = await Promise.all([
        api.habits.getAll(false),
        api.completions.getAll(),
        this.fetchRecentSteps(),
      ]);

      // Sync habits
      for (const serverHabit of serverHabits) {
        const localHabit = await HabitRepository.getById(serverHabit.id);

        if (!localHabit) {
          // New habit from server
          await HabitRepository.upsert(serverHabit, 'synced');
        } else if (localHabit.sync_status === 'synced') {
          // Resolve conflict using server-wins strategy
          const resolution = ConflictResolver.resolveHabit(localHabit, serverHabit);
          await HabitRepository.upsert(resolution.resolved, 'synced');
        }
        // Skip if local has pending changes
      }

      // Sync completions (merge strategy)
      const localCompletions = await CompletionRepository.getByDateRange(
        userId,
        this.getThirtyDaysAgo(),
        this.getToday()
      );

      const mergedCompletions = ConflictResolver.mergeCompletions(
        localCompletions.map((c) => ({
          id: c.id,
          habitId: c.habitId,
          userId: c.userId,
          date: c.date,
          completedAt: c.completedAt,
        })),
        serverCompletions.map((c) => ({
          id: c.id,
          habitId: c.habitId,
          userId: c.userId,
          date: c.date,
          completedAt: c.completedAt,
        }))
      );

      await CompletionRepository.bulkUpsert(mergedCompletions, 'synced');

      // Sync steps (max value strategy)
      for (const serverStep of serverSteps) {
        const localStep = await StepRepository.getByDate(userId, serverStep.date);
        const resolution = ConflictResolver.resolveStepData(localStep, {
          userId,
          date: serverStep.date,
          steps: serverStep.steps,
          distance: serverStep.distance,
          calories: serverStep.calories || 0,
          createdAt: serverStep.date,
          updatedAt: serverStep.date,
          sync_status: 'synced',
          last_synced_at: new Date().toISOString(),
        });

        if (resolution.resolved) {
          await StepRepository.upsert(
            userId,
            resolution.resolved.date,
            resolution.resolved.steps,
            resolution.resolved.distance,
            resolution.resolved.calories
          );
          await StepRepository.markAsSynced(userId, resolution.resolved.date);
        }
      }
    } catch (error) {
      console.error('Failed to pull server data:', error);
      throw error;
    }
  }

  /**
   * Process sync queue (retry failed operations)
   */
  private async processSyncQueue(userId: string): Promise<void> {
    const pendingItems = await SyncQueueRepository.getPending();

    for (const item of pendingItems) {
      try {
        const payload = JSON.parse(item.payload);

        switch (item.entityType) {
          case 'habit':
            if (item.operation === 'create') {
              await api.habits.create(payload);
            } else if (item.operation === 'update') {
              await api.habits.update(item.entityId!, payload);
            } else if (item.operation === 'delete') {
              await api.habits.delete(item.entityId!);
            }
            break;

          case 'completion':
            if (item.operation === 'create') {
              await api.completions.create(payload);
            } else if (item.operation === 'delete') {
              await api.completions.delete(payload.habitId, payload.date);
            }
            break;

          case 'step':
            await api.steps.logSteps(payload);
            break;
        }

        await SyncQueueRepository.markAsSucceeded(item.id!);
      } catch (error: any) {
        console.error(`Failed to process sync queue item ${item.id}:`, error);
        await SyncQueueRepository.markAsFailed(item.id!, error.message);
      }
    }
  }

  /**
   * Helper: Fetch habit from server
   */
  private async fetchHabitFromServer(habitId: string): Promise<Habit | null> {
    try {
      return await api.habits.getById(habitId);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getThirtyDaysAgo(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }

  /**
   * Quick sync for specific entity
   */
  async syncEntity(entityType: 'habit' | 'completion' | 'step', entityId: string): Promise<void> {
    if (!networkMonitor.isConnected()) {
      console.log('No network connection, skipping entity sync');
      return;
    }

    try {
      switch (entityType) {
        case 'habit':
          const habit = await HabitRepository.getById(entityId);
          if (habit && habit.sync_status === 'pending') {
            await api.habits.update(entityId, {
              title: habit.title,
              color: habit.color,
              icon: habit.icon || undefined,
            });
            await HabitRepository.markAsSynced(entityId);
          }
          break;
        // Add other entity types as needed
      }
    } catch (error) {
      console.error(`Failed to sync ${entityType} ${entityId}:`, error);
    }
  }

  /**
   * Sync steps to server
   */
  async syncStepsToServer(userId: string): Promise<void> {
    const pendingSteps = await StepRepository.getPendingSync(userId);

    for (const stepData of pendingSteps) {
      try {
        await api.steps.logSteps({
          date: stepData.date,
          steps: stepData.steps,
          distance: stepData.distance,
          calories: stepData.calories,
          source: 'pedometer',
        });
        await StepRepository.markAsSynced(userId, stepData.date);
      } catch (error) {
        console.error(`Failed to sync steps for ${stepData.date}:`, error);
      }
    }
  }
}

export const syncService = new SyncService();
