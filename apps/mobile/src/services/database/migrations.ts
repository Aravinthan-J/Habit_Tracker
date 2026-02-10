import * as SQLite from 'expo-sqlite';

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  console.log('Running database migrations...');

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // Create tables
      const createTablesSQL = `
        CREATE TABLE IF NOT EXISTS habits (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          frequency TEXT NOT NULL,
          icon TEXT,
          color TEXT,
          reminder_enabled INTEGER DEFAULT 0,
          reminder_time TEXT,
          streak INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          sync_status TEXT DEFAULT 'synced',
          last_synced_at TEXT,
          archived_at TEXT
        );

        CREATE TABLE IF NOT EXISTS completions (
          id TEXT PRIMARY KEY,
          habit_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          date TEXT NOT NULL,
          completed INTEGER DEFAULT 1,
          created_at TEXT NOT NULL,
          sync_status TEXT DEFAULT 'synced',
          last_synced_at TEXT
        );

        CREATE TABLE IF NOT EXISTS step_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          date TEXT NOT NULL,
          steps INTEGER DEFAULT 0,
          distance REAL DEFAULT 0,
          calories REAL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          sync_status TEXT DEFAULT 'synced',
          last_synced_at TEXT
        );

        CREATE TABLE IF NOT EXISTS badges (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          criteria TEXT NOT NULL,
          created_at TEXT NOT NULL,
          sync_status TEXT DEFAULT 'synced',
          last_synced_at TEXT
        );

        CREATE TABLE IF NOT EXISTS user_badges (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          badge_id TEXT NOT NULL,
          earned_at TEXT NOT NULL,
          sync_status TEXT DEFAULT 'synced',
          last_synced_at TEXT
        );

        CREATE TABLE IF NOT EXISTS sync_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          entity_type TEXT NOT NULL,
          entity_id TEXT,
          operation TEXT NOT NULL,
          payload TEXT NOT NULL,
          retry_count INTEGER DEFAULT 0,
          max_retries INTEGER DEFAULT 5,
          next_retry_at TEXT,
          error_message TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sync_metadata (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `;

      // Split by semicolon and execute each statement
      const statements = createTablesSQL
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      statements.forEach((statement) => {
        tx.executeSql(statement + ';');
      });

      // Create indexes
      const indexStatements = [
        'CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_habits_sync_status ON habits(sync_status)',
        'CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON completions(habit_id)',
        'CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(date)',
        'CREATE INDEX IF NOT EXISTS idx_completions_sync_status ON completions(sync_status)',
        'CREATE UNIQUE INDEX IF NOT EXISTS idx_completions_habit_date ON completions(habit_id, date)',
        'CREATE INDEX IF NOT EXISTS idx_step_data_user_id ON step_data(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_step_data_date ON step_data(date)',
        'CREATE INDEX IF NOT EXISTS idx_step_data_sync_status ON step_data(sync_status)',
        'CREATE UNIQUE INDEX IF NOT EXISTS idx_step_data_user_date ON step_data(user_id, date)',
        'CREATE INDEX IF NOT EXISTS idx_badges_sync_status ON badges(sync_status)',
        'CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id)',
        'CREATE INDEX IF NOT EXISTS idx_user_badges_sync_status ON user_badges(sync_status)',
        'CREATE UNIQUE INDEX IF NOT EXISTS idx_user_badges_user_badge ON user_badges(user_id, badge_id)',
        'CREATE INDEX IF NOT EXISTS idx_sync_queue_entity_type ON sync_queue(entity_type)',
        'CREATE INDEX IF NOT EXISTS idx_sync_queue_next_retry ON sync_queue(next_retry_at)',
      ];

      indexStatements.forEach((statement) => {
        tx.executeSql(statement);
      });
    },
    (error) => {
      console.error('Migration failed:', error);
      reject(error);
    },
    () => {
      console.log('Database migrations completed successfully');
      resolve();
    });
  });
}

export async function dropAllTables(db: SQLite.SQLiteDatabase): Promise<void> {
  console.log('Dropping all tables...');

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql('DROP TABLE IF EXISTS sync_metadata');
      tx.executeSql('DROP TABLE IF EXISTS sync_queue');
      tx.executeSql('DROP TABLE IF EXISTS user_badges');
      tx.executeSql('DROP TABLE IF EXISTS badges');
      tx.executeSql('DROP TABLE IF EXISTS step_data');
      tx.executeSql('DROP TABLE IF EXISTS completions');
      tx.executeSql('DROP TABLE IF EXISTS habits');
    },
    (error) => {
      console.error('Drop tables failed:', error);
      reject(error);
    },
    () => {
      console.log('All tables dropped');
      resolve();
    });
  });
}
