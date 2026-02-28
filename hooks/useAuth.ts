import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { isValidEmail, isValidPassword } from '@/utils/validators';

export function useAuth() {
    const { user, session, isLoading, isOffline, setSession, setLoading, setupDummyUser, clear } = useAuthStore();

    useEffect(() => {
        let mounted = true;

        // If Supabase is unreachable, fall back to offline/dummy mode after 5s
        const sessionTimeout = setTimeout(() => {
            if (mounted && isLoading) setupDummyUser();
        }, 5000);

        supabase.auth.getSession().then(({ data: { session } }) => {
            clearTimeout(sessionTimeout);
            if (mounted) {
                setSession(session);
                setLoading(false);
            }
        }).catch(() => {
            clearTimeout(sessionTimeout);
            if (mounted) setupDummyUser();
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setSession(session);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            clearTimeout(sessionTimeout);
            subscription.unsubscribe();
        };
    }, []);

    const offlineError = { error: { message: 'You appear to be offline. Please check your connection and try again.' } };

    const signIn = async (email: string, password: string) => {
        if (isOffline) return offlineError;
        if (!isValidEmail(email)) return { error: { message: 'Invalid email address' } };

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    };

    const signUp = async (email: string, password: string, name: string) => {
        if (isOffline) return offlineError;
        if (!isValidEmail(email)) return { error: { message: 'Invalid email address' } };
        const { valid, errors } = isValidPassword(password);
        if (!valid) return { error: { message: errors.join(', ') } };

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        });

        if (!error && data.user) {
            await supabase.from('profiles').insert({ id: data.user.id, email, name });
        }

        return { data, error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        clear();
    };

    const resetPassword = async (email: string) => {
        return await supabase.auth.resetPasswordForEmail(email);
    };

    return { user, session, isLoading, signIn, signUp, signOut, resetPassword };
}
