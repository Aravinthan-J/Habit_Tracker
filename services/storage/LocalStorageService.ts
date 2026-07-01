import getDatabase from '@/lib/database';
import { Habit, Completion, SyncOperation } from '@/types/habit.types';

export function generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}

// ─── Habits ──────────────────────────────────────────────────────────────────

export async function saveHabitLocally(habit: Habit): Promise<void> {
    const db = await getDatabase();
    const existing = await db.getFirstAsync<any>(
        `SELECT updated_at FROM local_habits WHERE id = ?`,
        [habit.id]
    );
    if (existing && new Date(existing.updated_at) > new Date(habit.updated_at)) return;

    await db.runAsync(
        `INSERT OR REPLACE INTO local_habits
     (id, user_id, title, monthly_goal, color, icon, notifications_enabled, reminder_time,
      frequency, smart_reminder, stack_after, schedule_days, "order", created_at, updated_at, archived_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
            habit.id,
            habit.user_id,
            habit.title,
            habit.monthly_goal,
            habit.color,
            habit.icon ?? null,
            habit.notifications_enabled ? 1 : 0,
            habit.reminder_time ?? null,
            habit.frequency ?? 'daily',
            habit.smart_reminder ? 1 : 0,
            habit.stack_after ?? null,
            habit.schedule_days ? JSON.stringify(habit.schedule_days) : null,
            habit.order ?? 0,
            habit.created_at,
            habit.updated_at,
            habit.archived_at ?? null,
        ]
    );
}

export async function getLocalHabits(userId: string): Promise<Habit[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
        `SELECT * FROM local_habits WHERE user_id = ? AND archived_at IS NULL ORDER BY "order" ASC, created_at DESC`,
        [userId]
    );
    return rows.map(rowToHabit);
}

export async function getArchivedLocalHabits(userId: string): Promise<Habit[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
        `SELECT * FROM local_habits WHERE user_id = ? AND archived_at IS NOT NULL ORDER BY archived_at DESC`,
        [userId]
    );
    return rows.map(rowToHabit);
}

export async function deleteLocalHabit(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM local_habits WHERE id = ?`, [id]);
}

export async function reorderHabitsLocally(orderedIds: string[]): Promise<void> {
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
        for (let i = 0; i < orderedIds.length; i++) {
            await db.runAsync(`UPDATE local_habits SET "order" = ? WHERE id = ?`, [i, orderedIds[i]]);
        }
    });
}

function rowToHabit(row: any): Habit {
    return {
        ...row,
        notifications_enabled: row.notifications_enabled === 1,
        smart_reminder: row.smart_reminder === 1,
        frequency: row.frequency === 'weekly' ? 'weekly' : 'daily',
        schedule_days: row.schedule_days ? JSON.parse(row.schedule_days) : null,
        order: row.order ?? 0,
    };
}

// ─── Completions ─────────────────────────────────────────────────────────────

export async function saveCompletionLocally(completion: Completion): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
        `INSERT OR REPLACE INTO local_completions (id, habit_id, user_id, date, completed_at, note, synced)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [completion.id, completion.habit_id, completion.user_id, completion.date, completion.completed_at, completion.note ?? null]
    );
}

export async function saveCompletionNoteLocally(habitId: string, date: string, note: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
        `UPDATE local_completions SET note = ? WHERE id = ?`,
        [note, `${habitId}_${date}`]
    );
}

export async function deleteCompletionLocally(habitId: string, date: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
        `DELETE FROM local_completions WHERE id = ?`,
        [`${habitId}_${date}`]
    );
}

export async function getLocalCompletions(userId: string, startDate: string, endDate: string): Promise<Completion[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Completion>(
        `SELECT * FROM local_completions WHERE user_id = ? AND date >= ? AND date <= ?`,
        [userId, startDate, endDate]
    );
}

export async function getAllLocalCompletions(userId: string): Promise<Completion[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Completion>(
        `SELECT * FROM local_completions WHERE user_id = ? ORDER BY date DESC`,
        [userId]
    );
}

// ─── Completion time log (smart reminders) ──────────────────────────────────

export async function logCompletionTime(
    habitId: string,
    userId: string,
    date: string,
    minutesOfDay: number
): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
        `INSERT OR REPLACE INTO completion_time_log (habit_id, user_id, date, minutes_of_day) VALUES (?, ?, ?, ?)`,
        [habitId, userId, date, minutesOfDay]
    );
}

export async function deleteCompletionTimeLog(habitId: string, date: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
        `DELETE FROM completion_time_log WHERE habit_id = ? AND date = ?`,
        [habitId, date]
    );
}

export async function getCompletionTimes(habitId: string, limit = 30): Promise<number[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ minutes_of_day: number }>(
        `SELECT minutes_of_day FROM completion_time_log WHERE habit_id = ? ORDER BY date DESC LIMIT ?`,
        [habitId, limit]
    );
    return rows.map((r) => r.minutes_of_day);
}

// ─── Sync Queue ───────────────────────────────────────────────────────────────

export async function queueOperation(op: Omit<SyncOperation, 'id'>): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
        `INSERT INTO sync_queue (operation, table_name, record_id, payload) VALUES (?, ?, ?, ?)`,
        [op.operation, op.table_name, op.record_id, op.payload]
    );
}

export async function getPendingOperations(): Promise<SyncOperation[]> {
    const db = await getDatabase();
    return await db.getAllAsync<SyncOperation>(
        `SELECT * FROM sync_queue WHERE attempts < 3 ORDER BY created_at ASC`
    );
}

export async function deleteSyncOperation(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, [id]);
}

export async function incrementAttempts(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`UPDATE sync_queue SET attempts = attempts + 1 WHERE id = ?`, [id]);
}
