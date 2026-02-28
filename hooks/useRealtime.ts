import { useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';

function safeSnapshot(
    ref: Parameters<typeof onSnapshot>[0],
    onNext: () => void,
): () => void {
    return onSnapshot(
        ref as any,
        onNext,
        // On error (offline / permission denied) — do nothing; React Query
        // will serve cached / SQLite data from its last successful fetch.
        (_err) => {},
    );
}

export function useRealtime() {
    const { user } = useAuthStore();
    const qc = useQueryClient();

    useEffect(() => {
        if (!user) return;

        const uid = user.uid;

        const unsubHabits = safeSnapshot(
            collection(db, 'users', uid, 'habits'),
            () => qc.invalidateQueries({ queryKey: ['habits', uid] }),
        );

        const unsubCompletions = safeSnapshot(
            collection(db, 'users', uid, 'completions'),
            () => qc.invalidateQueries({ queryKey: ['completions', uid] }),
        );

        const unsubBadges = safeSnapshot(
            collection(db, 'users', uid, 'user_badges'),
            () => qc.invalidateQueries({ queryKey: ['badges', uid] }),
        );

        const unsubDaily = safeSnapshot(
            collection(db, 'users', uid, 'daily'),
            () => qc.invalidateQueries({ queryKey: ['completions', uid] }),
        );

        return () => {
            unsubHabits();
            unsubCompletions();
            unsubBadges();
            unsubDaily();
        };
    }, [user?.uid]);
}
