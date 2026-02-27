import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (db) return db;
    db = await SQLite.openDatabaseAsync('habity.db');
    await initializeSchema(db);
    return db;
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
  `);
}

export default getDatabase;
