import * as SQLite from 'expo-sqlite';
import { SCHEMA } from './schema';

const DATABASE_NAME = 'habity.db';

export const db = SQLite.openDatabaseSync(DATABASE_NAME);

export const initializeDatabase = async () => {
    try {
        db.withTransactionSync(() => {
            db.execSync(SCHEMA.HABITS);
            db.execSync(SCHEMA.COMPLETIONS);
            db.execSync(SCHEMA.STEPS);
            db.execSync(SCHEMA.BADGES);
            db.execSync(SCHEMA.PREFERENCES);
            db.execSync(SCHEMA.INSERT_DEFAULT_PREFS);
        });
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};
