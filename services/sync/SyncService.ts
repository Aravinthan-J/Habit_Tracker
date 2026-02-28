import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import {
    getPendingOperations,
    deleteSyncOperation,
    incrementAttempts,
    saveHabitLocally,
} from '../storage/LocalStorageService';
import { SYNC_RETRY_LIMIT } from '@/lib/constants';

type SyncableCollection = 'habits' | 'completions' | 'step_data';

export async function processQueue(): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const ops = await getPendingOperations();
    if (ops.length === 0) return;

    for (const op of ops) {
        try {
            const payload = JSON.parse(op.payload);
            const tableName = op.table_name as SyncableCollection;
            const colRef = collection(db, 'users', userId, tableName);

            if (op.operation === 'INSERT') {
                await addDoc(colRef, payload);
            } else if (op.operation === 'UPDATE') {
                await updateDoc(doc(db, 'users', userId, tableName, op.record_id), payload);
            } else if (op.operation === 'DELETE') {
                await deleteDoc(doc(db, 'users', userId, tableName, op.record_id));
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
 * Pull fresh habits from Firestore and save locally
 */
export async function pullLatestHabits(userId: string): Promise<void> {
    const { getDocs } = await import('firebase/firestore');
    const snapshot = await getDocs(collection(db, 'users', userId, 'habits'));
    const habits = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as any))
        .filter((h) => h.archived_at === null);

    for (const habit of habits) {
        await saveHabitLocally(habit);
    }
}
