import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isOffline: boolean;
    setUser: (user: User | null) => void;
    setSession: (session: Session | null) => void;
    setLoading: (loading: boolean) => void;
    setupDummyUser: () => void;
    clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    isLoading: true,
    isOffline: false,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session, user: session?.user ?? null, isOffline: false }),
    setLoading: (isLoading) => set({ isLoading }),
    setupDummyUser: () => set({
        user: {
            id: '00000000-0000-0000-0000-000000000000',
            email: 'dummy@example.com',
            app_metadata: {},
            user_metadata: { full_name: 'Dummy User' },
            aud: 'authenticated',
            created_at: new Date().toISOString()
        } as any,
        session: { access_token: 'dummy', user: {} } as any,
        isLoading: false,
        isOffline: true,
    }),
    clear: () => set({ user: null, session: null, isLoading: false, isOffline: false }),
}));
