import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    collection,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { Habit, HabitInsert, HabitUpdate } from '@/types/habit.types';
import {
    saveHabitLocally,
    getLocalHabits,
    getArchivedLocalHabits,
    deleteLocalHabit,
    reorderHabitsLocally,
    queueOperation,
    generateId,
} from '@/services/storage/LocalStorageService';

function sortByOrder(habits: Habit[]): Habit[] {
    return [...habits].sort((a, b) => {
        const oa = a.order ?? 0;
        const ob = b.order ?? 0;
        if (oa !== ob) return oa - ob;
        return b.created_at.localeCompare(a.created_at);
    });
}

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
                    .filter((h) => h.archived_at === null || h.archived_at === undefined);
                for (const habit of data) await saveHabitLocally(habit);
                return sortByOrder(data);
            } catch {
                return getLocalHabits(user.uid);
            }
        },
        enabled: !!user,
        staleTime: 1000 * 30,
    });

    const archivedQuery = useQuery({
        queryKey: ['habits-archived', user?.uid],
        queryFn: async () => {
            if (!user) return [];
            try {
                const q = query(
                    collection(db, 'users', user.uid, 'habits'),
                    where('archived_at', '!=', null),
                );
                const snapshot = await getDocs(q);
                return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Habit));
            } catch {
                return getArchivedLocalHabits(user.uid);
            }
        },
        enabled: !!user,
        staleTime: 1000 * 60,
    });

    const createHabit = useMutation({
        mutationFn: async (input: Omit<HabitInsert, 'user_id'>) => {
            if (!user) throw new Error('Not authenticated');
            const currentHabits = qc.getQueryData<Habit[]>(['habits', user.uid]) ?? [];
            const maxOrder = currentHabits.reduce((m, h) => Math.max(m, h.order ?? 0), -1);
            const now = new Date().toISOString();
            const habitData = {
                ...input,
                user_id: user.uid,
                order: maxOrder + 1,
                created_at: now,
                updated_at: now,
                archived_at: null,
            };
            try {
                const docRef = doc(collection(db, 'users', user.uid, 'habits'));
                const habit: Habit = { id: docRef.id, ...habitData } as Habit;
                await setDoc(docRef, { ...habitData, id: docRef.id });
                await saveHabitLocally(habit);
                return habit;
            } catch {
                const tempId = generateId();
                const habit: Habit = { id: tempId, ...habitData } as Habit;
                await saveHabitLocally(habit);
                await queueOperation({
                    operation: 'INSERT',
                    table_name: 'habits',
                    record_id: tempId,
                    payload: JSON.stringify({ id: tempId, ...habitData }),
                });
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
                if (cached) await saveHabitLocally({ ...cached, ...updatesWithTimestamp });
                return { id, ...updatesWithTimestamp };
            } catch {
                const cached = (qc.getQueryData<Habit[]>(['habits', user?.uid]) ?? []).find((h) => h.id === id);
                if (cached) await saveHabitLocally({ ...cached, ...updatesWithTimestamp } as Habit);
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

    const archiveHabit = useMutation({
        mutationFn: async (id: string) => {
            const archived_at = new Date().toISOString();
            await updateDoc(doc(db, 'users', user!.uid, 'habits', id), { archived_at }).catch(async () => {
                await queueOperation({
                    operation: 'UPDATE',
                    table_name: 'habits',
                    record_id: id,
                    payload: JSON.stringify({ id, archived_at }),
                });
            });
            const cached = (qc.getQueryData<Habit[]>(['habits', user?.uid]) ?? []).find((h) => h.id === id);
            if (cached) await saveHabitLocally({ ...cached, archived_at });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['habits', user?.uid] });
            qc.invalidateQueries({ queryKey: ['habits-archived', user?.uid] });
        },
    });

    const unarchiveHabit = useMutation({
        mutationFn: async (id: string) => {
            const updated_at = new Date().toISOString();
            await updateDoc(doc(db, 'users', user!.uid, 'habits', id), { archived_at: null, updated_at }).catch(async () => {
                await queueOperation({
                    operation: 'UPDATE',
                    table_name: 'habits',
                    record_id: id,
                    payload: JSON.stringify({ id, archived_at: null, updated_at }),
                });
            });
            const archived = (qc.getQueryData<Habit[]>(['habits-archived', user?.uid]) ?? []).find((h) => h.id === id);
            if (archived) await saveHabitLocally({ ...archived, archived_at: null, updated_at });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['habits', user?.uid] });
            qc.invalidateQueries({ queryKey: ['habits-archived', user?.uid] });
        },
    });

    const reorderHabits = useMutation({
        mutationFn: async (orderedIds: string[]) => {
            await reorderHabitsLocally(orderedIds);
            const current = qc.getQueryData<Habit[]>(['habits', user?.uid]) ?? [];
            const reordered = orderedIds
                .map((id, i) => { const h = current.find((x) => x.id === id); return h ? { ...h, order: i } : null; })
                .filter(Boolean) as Habit[];
            qc.setQueryData(['habits', user?.uid], reordered);
            for (let i = 0; i < orderedIds.length; i++) {
                updateDoc(doc(db, 'users', user!.uid, 'habits', orderedIds[i]), { order: i }).catch(() => { });
            }
        },
    });

    return {
        habits: habitsQuery.data ?? [],
        archivedHabits: archivedQuery.data ?? [],
        isLoading: habitsQuery.isLoading,
        error: habitsQuery.error,
        createHabit,
        updateHabit,
        deleteHabit,
        archiveHabit,
        unarchiveHabit,
        reorderHabits,
        refetch: habitsQuery.refetch,
    };
}
