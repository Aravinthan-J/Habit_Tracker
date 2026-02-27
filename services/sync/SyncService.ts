import { supabase } from '@/lib/supabase';
import {
    getPendingOperations,
    deleteSyncOperation,
    incrementAttempts,
    saveHabitLocally,
    saveCompletionLocally,
} from '../storage/LocalStorageService';
import { SYNC_RETRY_LIMIT } from '@/lib/constants';

export async function processQueue(): Promise<void> {
    const ops = await getPendingOperations();
    if (ops.length === 0) return;

    for (const op of ops) {
        try {
            const payload = JSON.parse(op.payload);

            if (op.operation === 'INSERT') {
                const { error } = await supabase.from(op.table_name as any).insert(payload);
                if (error) throw error;
            } else if (op.operation === 'UPDATE') {
                const { error } = await supabase
                    .from(op.table_name as any)
                    .update(payload)
                    .eq('id', op.record_id);
                if (error) throw error;
            } else if (op.operation === 'DELETE') {
                const { error } = await supabase
                    .from(op.table_name as any)
                    .delete()
                    .eq('id', op.record_id);
                if (error) throw error;
            }

            if (op.id !== undefined) {
                await deleteSyncOperation(op.id);
            }
        } catch (err) {
            if (__DEV__) console.warn('[SyncService] op failed:', err);
            if (op.id !== undefined) {
                await incrementAttempts(op.id);
            }
        }
    }
}

/**
 * Pull fresh data from Supabase and save locally
 */
export async function pullLatestHabits(userId: string): Promise<void> {
    const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .is('archived_at', null);

    if (error || !data) return;

    for (const habit of data) {
        await saveHabitLocally(habit);
    }
}
