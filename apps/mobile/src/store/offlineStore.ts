import { create } from 'zustand';

/**
 * Sync operation types
 */
export type SyncOperationType =
  | 'CREATE_HABIT'
  | 'UPDATE_HABIT'
  | 'DELETE_HABIT'
  | 'MARK_COMPLETE'
  | 'MARK_INCOMPLETE';

/**
 * Sync operation interface
 */
export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  data: any;
  timestamp: number;
  retryCount: number;
}

/**
 * Offline state interface
 */
interface OfflineState {
  isOnline: boolean;
  isSyncing: boolean;
  syncQueue: SyncOperation[];
  lastSyncTime: number | null;

  // Actions
  setOnlineStatus: (isOnline: boolean) => void;
  setSyncing: (isSyncing: boolean) => void;
  queueOperation: (type: SyncOperationType, data: any) => void;
  removeOperation: (id: string) => void;
  clearQueue: () => void;
  setLastSyncTime: (time: number) => void;
  incrementRetryCount: (id: string) => void;
}

/**
 * Offline store using Zustand
 * Manages offline state and sync queue
 */
export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: true,
  isSyncing: false,
  syncQueue: [],
  lastSyncTime: null,

  /**
   * Set online status
   */
  setOnlineStatus: (isOnline) =>
    set({
      isOnline,
    }),

  /**
   * Set syncing status
   */
  setSyncing: (isSyncing) =>
    set({
      isSyncing,
    }),

  /**
   * Add operation to sync queue
   */
  queueOperation: (type, data) => {
    const operation: SyncOperation = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    set((state) => ({
      syncQueue: [...state.syncQueue, operation],
    }));
  },

  /**
   * Remove operation from queue
   */
  removeOperation: (id) =>
    set((state) => ({
      syncQueue: state.syncQueue.filter((op) => op.id !== id),
    })),

  /**
   * Clear all operations from queue
   */
  clearQueue: () =>
    set({
      syncQueue: [],
    }),

  /**
   * Set last sync timestamp
   */
  setLastSyncTime: (time) =>
    set({
      lastSyncTime: time,
    }),

  /**
   * Increment retry count for operation
   */
  incrementRetryCount: (id) =>
    set((state) => ({
      syncQueue: state.syncQueue.map((op) =>
        op.id === id ? { ...op, retryCount: op.retryCount + 1 } : op
      ),
    })),
}));
