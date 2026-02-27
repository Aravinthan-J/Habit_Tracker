import { create } from 'zustand';
import { SyncOperation } from '@/types/habit.types';

interface SyncState {
    pendingOps: SyncOperation[];
    isSyncing: boolean;
    lastSyncAt: string | null;
    addPendingOp: (op: SyncOperation) => void;
    removePendingOp: (id: number) => void;
    setSyncing: (syncing: boolean) => void;
    setLastSync: (time: string) => void;
    clearQueue: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
    pendingOps: [],
    isSyncing: false,
    lastSyncAt: null,
    addPendingOp: (op) =>
        set((state) => ({ pendingOps: [...state.pendingOps, op] })),
    removePendingOp: (id) =>
        set((state) => ({ pendingOps: state.pendingOps.filter((op) => op.id !== id) })),
    setSyncing: (isSyncing) => set({ isSyncing }),
    setLastSync: (time) => set({ lastSyncAt: time }),
    clearQueue: () => set({ pendingOps: [] }),
}));
