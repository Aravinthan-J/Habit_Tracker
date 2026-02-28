export const SCHEMA = {
    HABITS: `
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at TEXT NOT NULL,
      archived INTEGER DEFAULT 0
    );
  `,
    COMPLETIONS: `
    CREATE TABLE IF NOT EXISTS completions (
      id TEXT PRIMARY KEY NOT NULL,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      UNIQUE(habit_id, date),
      FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE
    );
  `,
    STEPS: `
    CREATE TABLE IF NOT EXISTS steps (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT UNIQUE NOT NULL,
      steps INTEGER NOT NULL,
      goal INTEGER NOT NULL,
      distance REAL NOT NULL,
      created_at TEXT NOT NULL
    );
  `,
    BADGES: `
    CREATE TABLE IF NOT EXISTS badges (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      requirement INTEGER NOT NULL,
      earned_at TEXT
    );
  `,
    PREFERENCES: `
    CREATE TABLE IF NOT EXISTS preferences (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      step_goal INTEGER DEFAULT 10000,
      reminder_time TEXT,
      theme TEXT DEFAULT 'system'
    );
  `,
    INSERT_DEFAULT_PREFS: `
    INSERT OR IGNORE INTO preferences (id, step_goal, theme) VALUES (1, 10000, 'system');
  `,
};
