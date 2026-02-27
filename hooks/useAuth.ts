import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { isValidEmail, isValidPassword } from '@/utils/validators';

export function useAuth() {
    const { user, session, isLoading, setSession, setLoading, clear } = useAuthStore();

    useEffect(() => {
        let mounted = true;

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (mounted) {
                setSession(session);
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setSession(session);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        if (!isValidEmail(email)) return { error: { message: 'Invalid email address' } };

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    };

    const signUp = async (email: string, password: string, name: string) => {
        if (!isValidEmail(email)) return { error: { message: 'Invalid email address' } };
        const { valid, errors } = isValidPassword(password);
        if (!valid) return { error: { message: errors.join(', ') } };

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        });

        if (!error && data.user) {
            // Create profile
            await supabase.from('profiles').insert({
                id: data.user.id,
                email,
                name,
            });
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
