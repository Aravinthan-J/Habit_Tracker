import { supabase } from '../supabase/supabaseClient';
import { databaseService } from '../database/DatabaseService';
import { HabitRepository } from '../database/repositories/HabitRepository';
import { CompletionRepository } from '../database/repositories/CompletionRepository';
import { StepRepository } from '../database/repositories/StepRepository';
import { SyncQueueRepository } from '../database/repositories/SyncQueueRepository';
import { ConflictResolver } from './ConflictResolver';
import { networkMonitor } from './NetworkMonitor';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getMigrationKey = (userId: string) => `initial_sync_${userId}`;

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

  async performFullSync(userId: string): Promise<SyncResult> {
    if (this.isSyncing && this.syncPromise) {
      console.log('Sync already in progress, waiting...');
      return this.syncPromise;
    }

    if (!networkMonitor.isConnected()) {
      return { success: false, error: 'No network connection', synced: { habits: 0, completions: 0, steps: 0 } };
    }

    this.isSyncing = true;
    this.syncPromise = this.executeSyncOperations(userId);

    try {
      return await this.syncPromise;
    } finally {
      this.isSyncing = false;
      this.syncPromise = null;
    }
  }

  private async executeSyncOperations(userId: string): Promise<SyncResult> {
    console.log('Starting full sync...');
    const result: SyncResult = { success: true, synced: { habits: 0, completions: 0, steps: 0 } };

    try {
      // Check if initial migration is needed (user-specific key)
      const migrationComplete = await AsyncStorage.getItem(getMigrationKey(userId));
      if (!migrationComplete) {
        await this.performInitialMigration(userId);
      }

      await this.pushLocalChanges(userId, result);
      await this.pullServerData(userId, result);
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
   * Initial migration: fetch all data from Supabase → local SQLite
   */
  private async performInitialMigration(userId: string): Promise<void> {
    console.log('Performing initial data migration from Supabase...');

    try {
      const [habitsRes, completionsRes, stepsRes] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', userId).is('archived_at', null),
        supabase.from('completions').select('*').eq('user_id', userId),
        supabase.from('step_data').select('*').eq('user_id', userId)
          .gte('date', this.getThirtyDaysAgo())
          .lte('date', this.getToday()),
      ]);

      const habits = habitsRes.data || [];
      const completions = completionsRes.data || [];
      const steps = stepsRes.data || [];

      console.log(`📥 Initial migration: ${habits.length} habits, ${completions.length} completions, ${steps.length} steps`);

      await databaseService.transaction(async () => {
        for (const habit of habits) {
          await HabitRepository.upsert(this.toLocalHabit(habit), 'synced');
        }
        for (const completion of completions) {
          await CompletionRepository.upsert(this.toLocalCompletion(completion), 'synced');
        }
        for (const step of steps) {
          await StepRepository.upsert(userId, step.date, step.steps, step.distance, step.calories || 0);
          await StepRepository.markAsSynced(userId, step.date);
        }
      });

      await AsyncStorage.setItem(getMigrationKey(userId), 'true');
      console.log('Initial migration completed successfully');
    } catch (error) {
      console.error('Initial migration failed:', error);
      throw error;
    }
  }

  /**
   * Push pending local changes to Supabase
   */
  private async pushLocalChanges(userId: string, result: SyncResult): Promise<void> {
    console.log('Pushing local changes to Supabase...');

    // Push habits
    const pendingHabits = await HabitRepository.getPendingSync();
    for (const habit of pendingHabits) {
      try {
        const { error } = await supabase.from('habits').upsert({
          id: habit.id,
          user_id: userId,
          title: habit.title,
          monthly_goal: habit.monthlyGoal,
          color: habit.color,
          icon: habit.icon,
          notifications_enabled: habit.notificationsEnabled,
          reminder_time: habit.reminderTime,
          updated_at: new Date().toISOString(),
          archived_at: habit.archivedAt || null,
        });
        if (error) throw error;
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
        const { error } = await supabase.from('completions').upsert({
          id: completion.id,
          habit_id: completion.habitId,
          user_id: userId,
          date: completion.date,
          completed_at: completion.completedAt,
        });
        if (error) throw error;
        await CompletionRepository.markAsSynced(completion.id);
        result.synced.completions++;
      } catch (error) {
        console.error(`Failed to push completion ${completion.id}:`, error);
      }
    }

    // Push steps
    const pendingSteps = await StepRepository.getPendingSync(userId);
    for (const step of pendingSteps) {
      try {
        const { error } = await supabase.from('step_data').upsert({
          user_id: userId,
          date: step.date,
          steps: step.steps,
          distance: step.distance,
          calories: step.calories,
          source: 'pedometer',
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
        await StepRepository.markAsSynced(userId, step.date);
        result.synced.steps++;
      } catch (error) {
        console.error(`Failed to push steps for ${step.date}:`, error);
      }
    }
  }

  /**
   * Pull Supabase data → local SQLite
   */
  private async pullServerData(userId: string, result: SyncResult): Promise<void> {
    console.log('Pulling Supabase data to local...');

    const [habitsRes, completionsRes, stepsRes] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', userId).is('archived_at', null),
      supabase.from('completions').select('*').eq('user_id', userId),
      supabase.from('step_data').select('*').eq('user_id', userId)
        .gte('date', this.getThirtyDaysAgo())
        .lte('date', this.getToday()),
    ]);

    const serverHabits = habitsRes.data || [];
    const serverCompletions = completionsRes.data || [];
    const serverSteps = stepsRes.data || [];

    console.log(`📥 Fetched from Supabase: ${serverHabits.length} habits, ${serverCompletions.length} completions, ${serverSteps.length} steps`);

    // Sync habits
    for (const serverHabit of serverHabits) {
      try {
        const localHabit = await HabitRepository.getById(serverHabit.id);
        const habitData = this.toLocalHabit(serverHabit);
        if (!localHabit) {
          await HabitRepository.upsert(habitData, 'synced');
          result.synced.habits++;
        } else if (localHabit.sync_status === 'synced') {
          const resolution = ConflictResolver.resolveHabit(localHabit, habitData);
          await HabitRepository.upsert(resolution.resolved, 'synced');
          result.synced.habits++;
        }
      } catch (error) {
        console.error(`Failed to sync habit ${serverHabit.id}:`, error);
      }
    }

    // Sync completions
    const localCompletions = await CompletionRepository.getByDateRange(userId, this.getThirtyDaysAgo(), this.getToday());
    const mergedCompletions = ConflictResolver.mergeCompletions(
      localCompletions.map(c => ({ id: c.id, habitId: c.habitId, userId: c.userId, date: c.date, completedAt: c.completedAt })),
      serverCompletions.map(c => ({ id: c.id, habitId: c.habit_id, userId: c.user_id, date: c.date, completedAt: c.completed_at }))
    );
    await CompletionRepository.bulkUpsert(mergedCompletions, 'synced');

    // Sync steps
    for (const serverStep of serverSteps) {
      const localStep = await StepRepository.getByDate(userId, serverStep.date);
      const resolution = ConflictResolver.resolveStepData(localStep, {
        userId,
        date: serverStep.date,
        steps: serverStep.steps,
        distance: serverStep.distance,
        calories: serverStep.calories || 0,
        createdAt: serverStep.created_at,
        updatedAt: serverStep.updated_at,
        sync_status: 'synced',
        last_synced_at: new Date().toISOString(),
      });
      if (resolution.resolved) {
        await StepRepository.upsert(userId, resolution.resolved.date, resolution.resolved.steps, resolution.resolved.distance, resolution.resolved.calories);
        await StepRepository.markAsSynced(userId, resolution.resolved.date);
      }
    }
  }

  /**
   * Retry failed sync queue items
   */
  private async processSyncQueue(userId: string): Promise<void> {
    const pendingItems = await SyncQueueRepository.getPending();

    for (const item of pendingItems) {
      try {
        const payload = JSON.parse(item.payload);

        switch (item.entityType) {
          case 'habit':
            if (item.operation === 'create' || item.operation === 'update') {
              await supabase.from('habits').upsert({ ...payload, user_id: userId });
            } else if (item.operation === 'delete') {
              await supabase.from('habits').update({ archived_at: new Date().toISOString() }).eq('id', item.entityId!);
            }
            break;
          case 'completion':
            if (item.operation === 'create') {
              await supabase.from('completions').upsert({ ...payload, user_id: userId });
            } else if (item.operation === 'delete') {
              await supabase.from('completions').delete().eq('habit_id', payload.habitId).eq('date', payload.date);
            }
            break;
          case 'step':
            await supabase.from('step_data').upsert({ ...payload, user_id: userId });
            break;
        }

        await SyncQueueRepository.markAsSucceeded(item.id!);
      } catch (error: any) {
        console.error(`Failed to process sync queue item ${item.id}:`, error);
        await SyncQueueRepository.markAsFailed(item.id!, error.message);
      }
    }
  }

  async syncStepsToServer(userId: string): Promise<void> {
    const pendingSteps = await StepRepository.getPendingSync(userId);
    for (const stepData of pendingSteps) {
      try {
        await supabase.from('step_data').upsert({
          user_id: userId,
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

  async syncEntity(entityType: 'habit' | 'completion' | 'step', entityId: string): Promise<void> {
    if (!networkMonitor.isConnected()) return;

    try {
      if (entityType === 'habit') {
        const habit = await HabitRepository.getById(entityId);
        if (habit && habit.sync_status === 'pending') {
          await supabase.from('habits').upsert({
            id: habit.id,
            user_id: habit.userId,
            title: habit.title,
            monthly_goal: habit.monthlyGoal,
            color: habit.color,
            icon: habit.icon,
            updated_at: new Date().toISOString(),
          });
          await HabitRepository.markAsSynced(entityId);
        }
      }
    } catch (error) {
      console.error(`Failed to sync ${entityType} ${entityId}:`, error);
    }
  }

  // Map Supabase snake_case to local camelCase
  private toLocalHabit(h: any) {
    return {
      id: h.id,
      userId: h.user_id,
      title: h.title,
      monthlyGoal: h.monthly_goal,
      color: h.color,
      icon: h.icon,
      notificationsEnabled: h.notifications_enabled,
      reminderTime: h.reminder_time,
      createdAt: h.created_at,
      updatedAt: h.updated_at,
      archivedAt: h.archived_at,
    };
  }

  private toLocalCompletion(c: any) {
    return {
      id: c.id,
      habitId: c.habit_id,
      userId: c.user_id,
      date: c.date,
      completedAt: c.completed_at,
    };
  }

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getThirtyDaysAgo(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }
}

export const syncService = new SyncService();
