import { create } from 'zustand';
import type { User } from 'firebase/auth';

interface AuthState {
    user: User | null;
    /** Avatar as a base64 data-URI (stored in Firestore, not Firebase Storage). */
    photoUri: string | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setPhotoUri: (uri: string | null) => void;
    setLoading: (loading: boolean) => void;
    clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    photoUri: null,
    isLoading: true,
    setUser: (user) => set({ user, isLoading: false }),
    setPhotoUri: (photoUri) => set({ photoUri }),
    setLoading: (isLoading) => set({ isLoading }),
    clear: () => set({ user: null, photoUri: null, isLoading: false }),
}));
