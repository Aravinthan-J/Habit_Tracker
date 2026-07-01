import * as SQLite from 'expo-sqlite';

// Promise-based singleton — guarantees openDatabaseAsync is called exactly once
// even when multiple callers request the DB before initialization finishes.
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!dbPromise) {
        dbPromise = (async () => {
            const database = await SQLite.openDatabaseAsync('habity.db');
            await initializeSchema(database);
            return database;
        })().catch((err) => {
            // Reset so the next call can retry
            dbPromise = null;
            throw err;
        });
    }
    return dbPromise;
}

async function initializeSchema(db: SQLite.SQLiteDatabase): Promise<void> {
    await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS local_habits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      monthly_goal INTEGER DEFAULT 20,
      color TEXT DEFAULT '#6C63FF',
      icon TEXT,
      notifications_enabled INTEGER DEFAULT 1,
      reminder_time TEXT,
      frequency TEXT DEFAULT 'daily',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      archived_at TEXT,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS local_completions (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed_at TEXT DEFAULT (datetime('now')),
      synced INTEGER DEFAULT 0,
      UNIQUE(habit_id, date)
    );

    CREATE TABLE IF NOT EXISTS local_step_data (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL UNIQUE,
      steps INTEGER NOT NULL DEFAULT 0,
      distance REAL,
      calories INTEGER,
      active_minutes INTEGER,
      source TEXT DEFAULT 'pedometer',
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation TEXT NOT NULL,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      attempts INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS completion_time_log (
      habit_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      minutes_of_day INTEGER NOT NULL,
      PRIMARY KEY (habit_id, date)
    );
  `);

    // Additive migrations — ignore "duplicate column" errors (no IF NOT EXISTS in SQLite).
    for (const stmt of [
        `ALTER TABLE local_habits ADD COLUMN smart_reminder INTEGER DEFAULT 0`,
        `ALTER TABLE local_habits ADD COLUMN stack_after TEXT`,
        `ALTER TABLE local_habits ADD COLUMN frequency TEXT DEFAULT 'daily'`,
        `ALTER TABLE local_habits ADD COLUMN schedule_days TEXT DEFAULT NULL`,
        `ALTER TABLE local_habits ADD COLUMN "order" INTEGER DEFAULT 0`,
        `ALTER TABLE local_completions ADD COLUMN note TEXT DEFAULT NULL`,
    ]) {
        await db.execAsync(stmt).catch(() => { });
    }
}

export default getDatabase;
