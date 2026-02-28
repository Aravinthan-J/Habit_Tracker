import { create } from 'zustand';

interface UIState {
    theme: 'dark' | 'light' | 'system';
    setTheme: (theme: 'dark' | 'light' | 'system') => void;
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
    isCustomizing: boolean;
    setIsCustomizing: (customizing: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    theme: 'system',
    setTheme: (theme) => set({ theme }),
    isLoading: false,
    setLoading: (loading) => set({ isLoading: loading }),
    isCustomizing: false,
    setIsCustomizing: (customizing) => set({ isCustomizing: customizing }),
}));
