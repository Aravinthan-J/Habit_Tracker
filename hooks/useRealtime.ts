import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function useRealtime() {
    const { user, isOffline } = useAuthStore();
    const qc = useQueryClient();

    useEffect(() => {
        if (!user || isOffline) return;

        const habitsChannel = supabase
            .channel('habits-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'habits', filter: `user_id=eq.${user.id}` },
                () => qc.invalidateQueries({ queryKey: ['habits', user.id] }))
            .subscribe();

        const completionsChannel = supabase
            .channel('completions-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'completions', filter: `user_id=eq.${user.id}` },
                () => qc.invalidateQueries({ queryKey: ['completions', user.id] }))
            .subscribe();

        const badgesChannel = supabase
            .channel('badges-channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_badges', filter: `user_id=eq.${user.id}` },
                () => qc.invalidateQueries({ queryKey: ['badges', user.id] }))
            .subscribe();

        return () => {
            habitsChannel.unsubscribe();
            completionsChannel.unsubscribe();
            badgesChannel.unsubscribe();
        };
    }, [user?.id, isOffline]);
}
