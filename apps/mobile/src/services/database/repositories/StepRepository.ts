import { databaseService, SyncStatus } from '../DatabaseService';

export interface StepData {
  id?: number;
  userId: string;
  date: string;
  steps: number;
  distance: number;
  calories: number;
  createdAt: string;
  updatedAt: string;
  sync_status: SyncStatus;
  last_synced_at: string | null;
}

interface DBStepDataRow {
  id: number;
  user_id: string;
  date: string;
  steps: number;
  distance: number;
  calories: number;
  created_at: string;
  updated_at: string;
  sync_status: SyncStatus;
  last_synced_at: string | null;
}

function mapDBRowToStepData(row: DBStepDataRow): StepData {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    steps: row.steps,
    distance: row.distance,
    calories: row.calories,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sync_status: row.sync_status,
    last_synced_at: row.last_synced_at,
  };
}

export class StepRepository {
  static async getByDate(userId: string, date: string): Promise<StepData | null> {
    const row = await databaseService.executeQuerySingle<DBStepDataRow>(
      `SELECT * FROM step_data WHERE user_id = ? AND date = ?`,
      [userId, date]
    );
    return row ? mapDBRowToStepData(row) : null;
  }

  static async getByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<StepData[]> {
    const rows = await databaseService.executeQuery<DBStepDataRow>(
      `SELECT * FROM step_data
       WHERE user_id = ? AND date >= ? AND date <= ?
       ORDER BY date DESC`,
      [userId, startDate, endDate]
    );
    return rows.map(mapDBRowToStepData);
  }

  static async getTodaySteps(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const row = await this.getByDate(userId, today);
    return row?.steps || 0;
  }

  static async upsertToday(userId: string, steps: number, distance: number, calories: number): Promise<StepData> {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    await databaseService.executeUpdate(
      `INSERT INTO step_data (
        user_id, date, steps, distance, calories, created_at, updated_at, sync_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, date) DO UPDATE SET
        steps = excluded.steps,
        distance = excluded.distance,
        calories = excluded.calories,
        updated_at = excluded.updated_at,
        sync_status = 'pending'`,
      [userId, today, steps, distance, calories, now, now, 'pending']
    );

    const result = await this.getByDate(userId, today);
    if (!result) {
      throw new Error('Failed to upsert step data');
    }
    return result;
  }

  static async upsert(userId: string, date: string, steps: number, distance: number, calories: number): Promise<void> {
    const now = new Date().toISOString();

    await databaseService.executeUpdate(
      `INSERT INTO step_data (
        user_id, date, steps, distance, calories, created_at, updated_at, sync_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, date) DO UPDATE SET
        steps = excluded.steps,
        distance = excluded.distance,
        calories = excluded.calories,
        updated_at = excluded.updated_at,
        sync_status = 'pending'`,
      [userId, date, steps, distance, calories, now, now, 'pending']
    );
  }

  static async markAsSynced(userId: string, date: string): Promise<void> {
    await databaseService.executeUpdate(
      `UPDATE step_data SET sync_status = ?, last_synced_at = ? WHERE user_id = ? AND date = ?`,
      ['synced', new Date().toISOString(), userId, date]
    );
  }

  static async getPendingSync(userId: string): Promise<StepData[]> {
    const rows = await databaseService.executeQuery<DBStepDataRow>(
      `SELECT * FROM step_data WHERE user_id = ? AND (sync_status = ? OR sync_status = ?)`,
      [userId, 'pending', 'error']
    );
    return rows.map(mapDBRowToStepData);
  }

  static async getLastSyncTime(): Promise<string | null> {
    const result = await databaseService.executeQuerySingle<{ value: string }>(
      `SELECT value FROM sync_metadata WHERE key = ?`,
      ['last_steps_sync']
    );
    return result?.value || null;
  }

  static async setLastSyncTime(time: string): Promise<void> {
    await databaseService.executeUpdate(
      `INSERT INTO sync_metadata (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      ['last_steps_sync', time, new Date().toISOString()]
    );
  }

  static async bulkUpsert(userId: string, data: Array<{ date: string; steps: number; distance: number; calories: number }>, syncStatus: SyncStatus = 'synced'): Promise<void> {
    await databaseService.transaction(async (db) => {
      const now = new Date().toISOString();
      for (const item of data) {
        await databaseService.executeUpdate(
          `INSERT INTO step_data (
            user_id, date, steps, distance, calories, created_at, updated_at, sync_status, last_synced_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, date) DO UPDATE SET
            steps = excluded.steps,
            distance = excluded.distance,
            calories = excluded.calories,
            updated_at = excluded.updated_at,
            sync_status = excluded.sync_status,
            last_synced_at = excluded.last_synced_at`,
          [userId, item.date, item.steps, item.distance, item.calories, now, now, syncStatus, now]
        );
      }
    });
  }

  static async getWeeklySteps(userId: string): Promise<StepData[]> {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);

    const startDate = weekAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    return this.getByDateRange(userId, startDate, endDate);
  }

  static async getMonthlySteps(userId: string, year: number, month: number): Promise<StepData[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    return this.getByDateRange(userId, startDate, endDate);
  }
}
