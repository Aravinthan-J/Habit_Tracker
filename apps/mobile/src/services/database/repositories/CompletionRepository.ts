import { databaseService, SyncStatus } from '../DatabaseService';
import type { Completion, CreateCompletionData } from '@habit-tracker/shared-types';

interface LocalCompletion extends Completion {
  sync_status: SyncStatus;
  last_synced_at: string | null;
}

interface DBCompletionRow {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  completed: number;
  created_at: string;
  sync_status: SyncStatus;
  last_synced_at: string | null;
}

function mapDBRowToCompletion(row: DBCompletionRow): LocalCompletion {
  return {
    id: row.id,
    habitId: row.habit_id,
    userId: row.user_id,
    date: row.date,
    completedAt: row.created_at,
    sync_status: row.sync_status,
    last_synced_at: row.last_synced_at,
  };
}

export class CompletionRepository {
  static async getByHabitId(habitId: string): Promise<LocalCompletion[]> {
    const rows = await databaseService.executeQuery<DBCompletionRow>(
      `SELECT * FROM completions WHERE habit_id = ? AND completed = 1 ORDER BY date DESC`,
      [habitId]
    );
    return rows.map(mapDBRowToCompletion);
  }

  static async getByDate(userId: string, date: string): Promise<LocalCompletion[]> {
    const rows = await databaseService.executeQuery<DBCompletionRow>(
      `SELECT * FROM completions WHERE user_id = ? AND date = ? AND completed = 1`,
      [userId, date]
    );
    return rows.map(mapDBRowToCompletion);
  }

  static async getByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<LocalCompletion[]> {
    const rows = await databaseService.executeQuery<DBCompletionRow>(
      `SELECT * FROM completions
       WHERE user_id = ? AND date >= ? AND date <= ? AND completed = 1
       ORDER BY date DESC`,
      [userId, startDate, endDate]
    );
    return rows.map(mapDBRowToCompletion);
  }

  static async getByHabitAndDateRange(
    habitId: string,
    startDate: string,
    endDate: string
  ): Promise<LocalCompletion[]> {
    const rows = await databaseService.executeQuery<DBCompletionRow>(
      `SELECT * FROM completions
       WHERE habit_id = ? AND date >= ? AND date <= ? AND completed = 1
       ORDER BY date DESC`,
      [habitId, startDate, endDate]
    );
    return rows.map(mapDBRowToCompletion);
  }

  static async exists(habitId: string, date: string): Promise<boolean> {
    const row = await databaseService.executeQuerySingle<{ count: number }>(
      `SELECT COUNT(*) as count FROM completions WHERE habit_id = ? AND date = ? AND completed = 1`,
      [habitId, date]
    );
    return (row?.count || 0) > 0;
  }

  static async create(
    userId: string,
    data: CreateCompletionData & { id: string }
  ): Promise<LocalCompletion> {
    const now = new Date().toISOString();
    const completion: Completion = {
      id: data.id,
      habitId: data.habitId,
      userId,
      date: data.date,
      completedAt: now,
    };

    await databaseService.executeUpdate(
      `INSERT INTO completions (
        id, habit_id, user_id, date, completed, created_at, sync_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(habit_id, date) DO UPDATE SET
        completed = 1,
        created_at = excluded.created_at,
        sync_status = 'pending'`,
      [
        completion.id,
        completion.habitId,
        completion.userId,
        completion.date,
        1,
        completion.completedAt,
        'pending',
      ]
    );

    return {
      ...completion,
      sync_status: 'pending',
      last_synced_at: null,
    };
  }

  static async delete(habitId: string, date: string): Promise<void> {
    // Mark as not completed
    await databaseService.executeUpdate(
      `UPDATE completions SET completed = 0, sync_status = ? WHERE habit_id = ? AND date = ?`,
      ['pending', habitId, date]
    );
  }

  static async toggle(
    userId: string,
    habitId: string,
    date: string,
    completionId: string
  ): Promise<boolean> {
    const exists = await this.exists(habitId, date);

    if (exists) {
      await this.delete(habitId, date);
      return false;
    } else {
      await this.create(userId, { id: completionId, habitId, date });
      return true;
    }
  }

  static async upsert(completion: Completion, syncStatus: SyncStatus = 'synced'): Promise<void> {
    await databaseService.executeUpdate(
      `INSERT INTO completions (
        id, habit_id, user_id, date, completed, created_at, sync_status, last_synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(habit_id, date) DO UPDATE SET
        id = excluded.id,
        completed = 1,
        created_at = excluded.created_at,
        sync_status = excluded.sync_status,
        last_synced_at = excluded.last_synced_at`,
      [
        completion.id,
        completion.habitId,
        completion.userId,
        completion.date,
        1,
        completion.completedAt,
        syncStatus,
        new Date().toISOString(),
      ]
    );
  }

  static async markAsSynced(id: string): Promise<void> {
    await databaseService.executeUpdate(
      `UPDATE completions SET sync_status = ?, last_synced_at = ? WHERE id = ?`,
      ['synced', new Date().toISOString(), id]
    );
  }

  static async markAsPending(habitId: string, date: string): Promise<void> {
    await databaseService.executeUpdate(
      `UPDATE completions SET sync_status = ? WHERE habit_id = ? AND date = ?`,
      ['pending', habitId, date]
    );
  }

  static async getPendingSync(): Promise<LocalCompletion[]> {
    const rows = await databaseService.executeQuery<DBCompletionRow>(
      `SELECT * FROM completions WHERE sync_status = ? OR sync_status = ?`,
      ['pending', 'error']
    );
    return rows.map(mapDBRowToCompletion);
  }

  static async getLastSyncTime(): Promise<string | null> {
    const result = await databaseService.executeQuerySingle<{ value: string }>(
      `SELECT value FROM sync_metadata WHERE key = ?`,
      ['last_completions_sync']
    );
    return result?.value || null;
  }

  static async setLastSyncTime(time: string): Promise<void> {
    await databaseService.executeUpdate(
      `INSERT INTO sync_metadata (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      ['last_completions_sync', time, new Date().toISOString()]
    );
  }

  static async bulkUpsert(completions: Completion[], syncStatus: SyncStatus = 'synced'): Promise<void> {
    await databaseService.transaction(async (db) => {
      for (const completion of completions) {
        await databaseService.executeUpdate(
          `INSERT INTO completions (
            id, habit_id, user_id, date, completed, created_at, sync_status, last_synced_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(habit_id, date) DO UPDATE SET
            id = excluded.id,
            completed = 1,
            created_at = excluded.created_at,
            sync_status = excluded.sync_status,
            last_synced_at = excluded.last_synced_at`,
          [
            completion.id,
            completion.habitId,
            completion.userId,
            completion.date,
            1,
            completion.completedAt,
            syncStatus,
            new Date().toISOString(),
          ]
        );
      }
    });
  }
}
