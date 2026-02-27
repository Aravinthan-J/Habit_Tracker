import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

export type SyncStatus = 'synced' | 'pending' | 'error';

export interface QueryResult {
  insertId?: number;
  rowsAffected: number;
  lastInsertRowId?: number;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.db = await SQLite.openDatabaseAsync('habit_tracker.db');
      await runMigrations(this.db);
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db || !this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  async executeQuery<T = any>(
    query: string,
    params?: any[]
  ): Promise<T[]> {
    const db = this.getDatabase();
    return db.getAllAsync<T>(query, params || []);
  }

  async executeQuerySingle<T = any>(
    query: string,
    params?: any[]
  ): Promise<T | null> {
    const db = this.getDatabase();
    return db.getFirstAsync<T>(query, params || []);
  }

  async executeUpdate(
    query: string,
    params?: any[]
  ): Promise<QueryResult> {
    const db = this.getDatabase();
    const result = await db.runAsync(query, params || []);
    return {
      insertId: result.lastInsertRowId,
      rowsAffected: result.changes,
      lastInsertRowId: result.lastInsertRowId,
    };
  }

  async transaction<T>(
    callback: (db: SQLite.SQLiteDatabase) => Promise<T>
  ): Promise<T> {
    const db = this.getDatabase();
    let result: T;
    await db.withTransactionAsync(async () => {
      result = await callback(db);
    });
    return result!;
  }

  async clearAllData(): Promise<void> {
    await this.executeUpdate('DELETE FROM sync_queue');
    await this.executeUpdate('DELETE FROM user_badges');
    await this.executeUpdate('DELETE FROM badges');
    await this.executeUpdate('DELETE FROM step_data');
    await this.executeUpdate('DELETE FROM completions');
    await this.executeUpdate('DELETE FROM habits');
    await this.executeUpdate('DELETE FROM sync_metadata');
    console.log('All data cleared from database');
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
      console.log('Database closed');
    }
  }
}

export const databaseService = new DatabaseService();
