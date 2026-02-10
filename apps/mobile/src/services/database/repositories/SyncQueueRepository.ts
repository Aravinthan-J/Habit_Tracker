import { databaseService } from '../DatabaseService';

export type EntityType = 'habit' | 'completion' | 'step' | 'badge';
export type OperationType = 'create' | 'update' | 'delete';

export interface SyncQueueItem {
  id?: number;
  entityType: EntityType;
  entityId: string | null;
  operation: OperationType;
  payload: string;
  retryCount: number;
  maxRetries: number;
  nextRetryAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DBSyncQueueRow {
  id: number;
  entity_type: EntityType;
  entity_id: string | null;
  operation: OperationType;
  payload: string;
  retry_count: number;
  max_retries: number;
  next_retry_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

function mapDBRowToSyncQueueItem(row: DBSyncQueueRow): SyncQueueItem {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    operation: row.operation,
    payload: row.payload,
    retryCount: row.retry_count,
    maxRetries: row.max_retries,
    nextRetryAt: row.next_retry_at,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SyncQueueRepository {
  static async add(
    entityType: EntityType,
    operation: OperationType,
    payload: any,
    entityId?: string
  ): Promise<SyncQueueItem> {
    const now = new Date().toISOString();

    const result = await databaseService.executeUpdate(
      `INSERT INTO sync_queue (
        entity_type, entity_id, operation, payload, retry_count, max_retries,
        next_retry_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entityType,
        entityId || null,
        operation,
        JSON.stringify(payload),
        0,
        5,
        now, // Try immediately
        now,
        now,
      ]
    );

    return {
      id: result.lastInsertRowId,
      entityType,
      entityId: entityId || null,
      operation,
      payload: JSON.stringify(payload),
      retryCount: 0,
      maxRetries: 5,
      nextRetryAt: now,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  static async getAll(): Promise<SyncQueueItem[]> {
    const rows = await databaseService.executeQuery<DBSyncQueueRow>(
      `SELECT * FROM sync_queue ORDER BY created_at ASC`
    );
    return rows.map(mapDBRowToSyncQueueItem);
  }

  static async getPending(): Promise<SyncQueueItem[]> {
    const now = new Date().toISOString();
    const rows = await databaseService.executeQuery<DBSyncQueueRow>(
      `SELECT * FROM sync_queue
       WHERE retry_count < max_retries
       AND (next_retry_at IS NULL OR next_retry_at <= ?)
       ORDER BY created_at ASC`,
      [now]
    );
    return rows.map(mapDBRowToSyncQueueItem);
  }

  static async markAsSucceeded(id: number): Promise<void> {
    await databaseService.executeUpdate(
      `DELETE FROM sync_queue WHERE id = ?`,
      [id]
    );
  }

  static async markAsFailed(id: number, error: string): Promise<void> {
    const item = await databaseService.executeQuerySingle<DBSyncQueueRow>(
      `SELECT * FROM sync_queue WHERE id = ?`,
      [id]
    );

    if (!item) return;

    const retryCount = item.retry_count + 1;
    const nextRetryAt = this.calculateNextRetryTime(retryCount);

    await databaseService.executeUpdate(
      `UPDATE sync_queue
       SET retry_count = ?,
           next_retry_at = ?,
           error_message = ?,
           updated_at = ?
       WHERE id = ?`,
      [retryCount, nextRetryAt, error, new Date().toISOString(), id]
    );
  }

  static async remove(id: number): Promise<void> {
    await databaseService.executeUpdate(
      `DELETE FROM sync_queue WHERE id = ?`,
      [id]
    );
  }

  static async clearAll(): Promise<void> {
    await databaseService.executeUpdate(`DELETE FROM sync_queue`);
  }

  static async getFailedItems(): Promise<SyncQueueItem[]> {
    const rows = await databaseService.executeQuery<DBSyncQueueRow>(
      `SELECT * FROM sync_queue WHERE retry_count >= max_retries ORDER BY created_at ASC`
    );
    return rows.map(mapDBRowToSyncQueueItem);
  }

  static async retryFailed(): Promise<void> {
    const now = new Date().toISOString();
    await databaseService.executeUpdate(
      `UPDATE sync_queue
       SET retry_count = 0,
           next_retry_at = ?,
           error_message = NULL,
           updated_at = ?
       WHERE retry_count >= max_retries`,
      [now, now]
    );
  }

  private static calculateNextRetryTime(retryCount: number): string {
    // Exponential backoff: 1s, 5s, 30s, 5min, 30min
    const delays = [1, 5, 30, 300, 1800]; // in seconds
    const delayIndex = Math.min(retryCount - 1, delays.length - 1);
    const delay = delays[delayIndex] * 1000; // convert to ms

    const nextRetry = new Date(Date.now() + delay);
    return nextRetry.toISOString();
  }

  static async getByEntityId(entityType: EntityType, entityId: string): Promise<SyncQueueItem[]> {
    const rows = await databaseService.executeQuery<DBSyncQueueRow>(
      `SELECT * FROM sync_queue WHERE entity_type = ? AND entity_id = ? ORDER BY created_at ASC`,
      [entityType, entityId]
    );
    return rows.map(mapDBRowToSyncQueueItem);
  }

  static async removeByEntityId(entityType: EntityType, entityId: string): Promise<void> {
    await databaseService.executeUpdate(
      `DELETE FROM sync_queue WHERE entity_type = ? AND entity_id = ?`,
      [entityType, entityId]
    );
  }
}
