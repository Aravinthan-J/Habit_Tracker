import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { usePreferencesStore, ThemeMode } from '@/store/preferencesStore';
import { getColors, ThemeColors, ColorScheme } from '@/constants/theme';

interface ThemeContextValue {
    colors: ThemeColors;
    scheme: ColorScheme;
    mode: ThemeMode;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
    colors: getColors('dark'),
    scheme: 'dark',
    mode: 'dark',
    isDark: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const mode = usePreferencesStore((s) => s.themeMode);
    const systemScheme = useColorScheme();

    const value = useMemo<ThemeContextValue>(() => {
        const scheme: ColorScheme =
            mode === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : mode;
        return {
            colors: getColors(scheme),
            scheme,
            mode,
            isDark: scheme === 'dark',
        };
    }, [mode, systemScheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
    return useContext(ThemeContext);
}
