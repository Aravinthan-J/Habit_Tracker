import { create } from 'zustand';
import type { User } from 'firebase/auth';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isOffline: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setupDummyUser: () => void;
    clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    isOffline: false,
    setUser: (user) => set({ user, isLoading: false, isOffline: false }),
    setLoading: (isLoading) => set({ isLoading }),
    setupDummyUser: () => set({
        user: {
            uid: '00000000-0000-0000-0000-000000000000',
            email: 'offline@example.com',
            displayName: 'Offline User',
        } as any,
        isLoading: false,
        isOffline: true,
    }),
    clear: () => set({ user: null, isLoading: false, isOffline: false }),
}));
