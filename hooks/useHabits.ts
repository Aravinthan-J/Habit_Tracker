import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { Habit, HabitInsert, HabitUpdate } from '@/types/habit.types';
import {
    saveHabitLocally,
    getLocalHabits,
    deleteLocalHabit,
    queueOperation,
    generateId,
} from '@/services/storage/LocalStorageService';

export function useHabits() {
    const { user } = useAuthStore();
    const qc = useQueryClient();

    const habitsQuery = useQuery({
        queryKey: ['habits', user?.uid],
        queryFn: async () => {
            if (!user) return [];
            try {
                const snapshot = await getDocs(collection(db, 'users', user.uid, 'habits'));
                const data: Habit[] = snapshot.docs
                    .map((d) => ({ id: d.id, ...d.data() } as Habit))
                    .filter((h) => h.archived_at === null)
                    .sort((a, b) => b.created_at.localeCompare(a.created_at));

                for (const habit of data) {
                    await saveHabitLocally(habit);
                }
                return data;
            } catch {
                return getLocalHabits(user.uid);
            }
        },
        enabled: !!user,
        staleTime: 1000 * 30,
    });

    const createHabit = useMutation({
        mutationFn: async (input: Omit<HabitInsert, 'user_id'>) => {
            if (!user) throw new Error('Not authenticated');

            const now = new Date().toISOString();
            const habitData = {
                ...input,
                user_id: user.uid,
                created_at: now,
                updated_at: now,
                archived_at: null,
            };

            try {
                const docRef = await addDoc(collection(db, 'users', user.uid, 'habits'), habitData);
                const habit: Habit = { id: docRef.id, ...habitData } as Habit;
                await saveHabitLocally(habit);
                return habit;
            } catch (firestoreErr) {
                // Save locally so the habit appears immediately in the UI
                const tempId = generateId();
                const habit: Habit = { id: tempId, ...habitData } as Habit;
                await saveHabitLocally(habit);
                await queueOperation({
                    operation: 'INSERT',
                    table_name: 'habits',
                    record_id: tempId,
                    payload: JSON.stringify(habitData),
                });
                // Return (not throw) so onSuccess fires and the query refreshes
                return habit;
            }
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['habits', user?.uid] }),
    });

    const updateHabit = useMutation({
        mutationFn: async ({ id, ...updates }: HabitUpdate & { id: string }) => {
            const updatesWithTimestamp = { ...updates, updated_at: new Date().toISOString() };
            try {
                await updateDoc(doc(db, 'users', user!.uid, 'habits', id), updatesWithTimestamp);
                const cached = (qc.getQueryData<Habit[]>(['habits', user?.uid]) ?? []).find((h) => h.id === id);
                if (cached) {
                    const updated = { ...cached, ...updatesWithTimestamp };
                    await saveHabitLocally(updated);
                }
                return { id, ...updatesWithTimestamp };
            } catch {
                const cached = (qc.getQueryData<Habit[]>(['habits', user?.uid]) ?? []).find((h) => h.id === id);
                if (cached) {
                    await saveHabitLocally({ ...cached, ...updatesWithTimestamp } as Habit);
                }
                await queueOperation({
                    operation: 'UPDATE',
                    table_name: 'habits',
                    record_id: id,
                    payload: JSON.stringify({ id, ...updatesWithTimestamp }),
                });
            }
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['habits', user?.uid] }),
    });

    const deleteHabit = useMutation({
        mutationFn: async (id: string) => {
            try {
                await deleteDoc(doc(db, 'users', user!.uid, 'habits', id));
            } catch {
                await queueOperation({
                    operation: 'DELETE',
                    table_name: 'habits',
                    record_id: id,
                    payload: JSON.stringify({ id }),
                });
            }
            await deleteLocalHabit(id);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['habits', user?.uid] }),
    });

    return {
        habits: habitsQuery.data ?? [],
        isLoading: habitsQuery.isLoading,
        error: habitsQuery.error,
        createHabit,
        updateHabit,
        deleteHabit,
        refetch: habitsQuery.refetch,
    };
}
