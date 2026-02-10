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
      this.db = SQLite.openDatabase('habit_tracker.db');
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

  async executeQuery<T = any>(
    query: string,
    params?: any[]
  ): Promise<T[]> {
    const db = this.getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          query,
          params || [],
          (_, result) => {
            const rows: T[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              rows.push(result.rows.item(i));
            }
            resolve(rows);
          },
          (_, error) => {
            console.error('Query execution failed:', query, params, error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async executeQuerySingle<T = any>(
    query: string,
    params?: any[]
  ): Promise<T | null> {
    const results = await this.executeQuery<T>(query, params);
    return results.length > 0 ? results[0] : null;
  }

  async executeUpdate(
    query: string,
    params?: any[]
  ): Promise<QueryResult> {
    const db = this.getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          query,
          params || [],
          (_, result) => {
            resolve({
              insertId: result.insertId,
              rowsAffected: result.rowsAffected,
              lastInsertRowId: result.insertId,
            });
          },
          (_, error) => {
            console.error('Update execution failed:', query, params, error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async transaction<T>(
    callback: (tx: any) => Promise<T>
  ): Promise<T> {
    const db = this.getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(
        async (tx) => {
          try {
            const result = await callback(tx);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          console.error('Transaction failed:', error);
          reject(error);
        }
      );
    });
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
