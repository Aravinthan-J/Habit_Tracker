import { databaseService, SyncStatus } from '../DatabaseService';
import type { Habit, CreateHabitData, UpdateHabitData } from '@habit-tracker/shared-types';

interface LocalHabit extends Habit {
  sync_status: SyncStatus;
  last_synced_at: string | null;
}

interface DBHabitRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency: string;
  icon: string | null;
  color: string;
  reminder_enabled: number;
  reminder_time: string | null;
  streak: number;
  created_at: string;
  updated_at: string;
  sync_status: SyncStatus;
  last_synced_at: string | null;
  archived_at: string | null;
}

function mapDBRowToHabit(row: DBHabitRow): LocalHabit {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.name,
    monthlyGoal: 0, // Will be calculated from completions
    color: row.color,
    icon: row.icon,
    notificationsEnabled: row.reminder_enabled === 1,
    reminderTime: row.reminder_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
    sync_status: row.sync_status,
    last_synced_at: row.last_synced_at,
  };
}

function mapHabitToDBRow(habit: Habit): Partial<DBHabitRow> {
  return {
    id: habit.id,
    user_id: habit.userId,
    name: habit.title,
    icon: habit.icon,
    color: habit.color,
    reminder_enabled: habit.notificationsEnabled ? 1 : 0,
    reminder_time: habit.reminderTime,
    created_at: habit.createdAt,
    updated_at: habit.updatedAt,
    archived_at: habit.archivedAt,
  };
}

export class HabitRepository {
  static async getAll(userId: string): Promise<LocalHabit[]> {
    const rows = await databaseService.executeQuery<DBHabitRow>(
      `SELECT * FROM habits WHERE user_id = ? AND archived_at IS NULL ORDER BY created_at DESC`,
      [userId]
    );
    return rows.map(mapDBRowToHabit);
  }

  static async getById(id: string): Promise<LocalHabit | null> {
    const row = await databaseService.executeQuerySingle<DBHabitRow>(
      `SELECT * FROM habits WHERE id = ?`,
      [id]
    );
    return row ? mapDBRowToHabit(row) : null;
  }

  static async create(userId: string, data: CreateHabitData & { id: string }): Promise<LocalHabit> {
    const now = new Date().toISOString();
    const habit: Habit = {
      id: data.id,
      userId,
      title: data.title,
      monthlyGoal: data.monthlyGoal,
      color: data.color || '#6366F1',
      icon: data.icon || null,
      notificationsEnabled: data.notificationsEnabled || false,
      reminderTime: data.reminderTime || null,
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
    };

    await databaseService.executeUpdate(
      `INSERT INTO habits (
        id, user_id, name, frequency, icon, color,
        reminder_enabled, reminder_time, created_at, updated_at,
        sync_status, archived_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        habit.id,
        habit.userId,
        habit.title,
        'daily', // Default frequency
        habit.icon,
        habit.color,
        habit.notificationsEnabled ? 1 : 0,
        habit.reminderTime,
        habit.createdAt,
        habit.updatedAt,
        'pending',
        habit.archivedAt,
      ]
    );

    return {
      ...habit,
      sync_status: 'pending',
      last_synced_at: null,
    };
  }

  static async update(id: string, data: UpdateHabitData): Promise<void> {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push('name = ?');
      params.push(data.title);
    }
    if (data.color !== undefined) {
      updates.push('color = ?');
      params.push(data.color);
    }
    if (data.icon !== undefined) {
      updates.push('icon = ?');
      params.push(data.icon);
    }
    if (data.notificationsEnabled !== undefined) {
      updates.push('reminder_enabled = ?');
      params.push(data.notificationsEnabled ? 1 : 0);
    }
    if (data.reminderTime !== undefined) {
      updates.push('reminder_time = ?');
      params.push(data.reminderTime);
    }

    if (updates.length === 0) return;

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());

    updates.push('sync_status = ?');
    params.push('pending');

    params.push(id);

    await databaseService.executeUpdate(
      `UPDATE habits SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  static async delete(id: string): Promise<void> {
    // Soft delete by setting archived_at
    await databaseService.executeUpdate(
      `UPDATE habits SET archived_at = ?, updated_at = ?, sync_status = ? WHERE id = ?`,
      [new Date().toISOString(), new Date().toISOString(), 'pending', id]
    );
  }

  static async upsert(habit: Habit, syncStatus: SyncStatus = 'synced'): Promise<void> {
    const dbRow = mapHabitToDBRow(habit);

    await databaseService.executeUpdate(
      `INSERT INTO habits (
        id, user_id, name, frequency, icon, color,
        reminder_enabled, reminder_time, created_at, updated_at,
        sync_status, last_synced_at, archived_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        icon = excluded.icon,
        color = excluded.color,
        reminder_enabled = excluded.reminder_enabled,
        reminder_time = excluded.reminder_time,
        updated_at = excluded.updated_at,
        sync_status = excluded.sync_status,
        last_synced_at = excluded.last_synced_at,
        archived_at = excluded.archived_at`,
      [
        dbRow.id,
        dbRow.user_id,
        dbRow.name,
        'daily',
        dbRow.icon,
        dbRow.color,
        dbRow.reminder_enabled,
        dbRow.reminder_time,
        dbRow.created_at,
        dbRow.updated_at,
        syncStatus,
        new Date().toISOString(),
        dbRow.archived_at,
      ]
    );
  }

  static async markAsSynced(id: string): Promise<void> {
    await databaseService.executeUpdate(
      `UPDATE habits SET sync_status = ?, last_synced_at = ? WHERE id = ?`,
      ['synced', new Date().toISOString(), id]
    );
  }

  static async markAsPending(id: string): Promise<void> {
    await databaseService.executeUpdate(
      `UPDATE habits SET sync_status = ? WHERE id = ?`,
      ['pending', id]
    );
  }

  static async markAsError(id: string, error?: string): Promise<void> {
    await databaseService.executeUpdate(
      `UPDATE habits SET sync_status = ? WHERE id = ?`,
      ['error', id]
    );
  }

  static async getPendingSync(): Promise<LocalHabit[]> {
    const rows = await databaseService.executeQuery<DBHabitRow>(
      `SELECT * FROM habits WHERE sync_status = ? OR sync_status = ?`,
      ['pending', 'error']
    );
    return rows.map(mapDBRowToHabit);
  }

  static async getLastSyncTime(): Promise<string | null> {
    const result = await databaseService.executeQuerySingle<{ value: string }>(
      `SELECT value FROM sync_metadata WHERE key = ?`,
      ['last_habits_sync']
    );
    return result?.value || null;
  }

  static async setLastSyncTime(time: string): Promise<void> {
    await databaseService.executeUpdate(
      `INSERT INTO sync_metadata (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      ['last_habits_sync', time, new Date().toISOString()]
    );
  }
}
