import { useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';

export function useRealtime() {
    const { user, isOffline } = useAuthStore();
    const qc = useQueryClient();

    useEffect(() => {
        if (!user || isOffline) return;

        const unsubHabits = onSnapshot(
            collection(db, 'users', user.uid, 'habits'),
            () => qc.invalidateQueries({ queryKey: ['habits', user.uid] })
        );

        const unsubCompletions = onSnapshot(
            collection(db, 'users', user.uid, 'completions'),
            () => qc.invalidateQueries({ queryKey: ['completions', user.uid] })
        );

        const unsubBadges = onSnapshot(
            collection(db, 'users', user.uid, 'user_badges'),
            () => qc.invalidateQueries({ queryKey: ['badges', user.uid] })
        );

        return () => {
            unsubHabits();
            unsubCompletions();
            unsubBadges();
        };
    }, [user?.uid, isOffline]);
}
