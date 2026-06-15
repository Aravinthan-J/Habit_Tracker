import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { usePreferencesStore, ThemeMode } from '@/store/preferencesStore';
import { getColors, applyAccent, ThemeColors, ColorScheme } from '@/constants/theme';

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
    const accentColor = usePreferencesStore((s) => s.accentColor);
    const systemScheme = useColorScheme();

    const value = useMemo<ThemeContextValue>(() => {
        const scheme: ColorScheme =
            mode === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : mode;
        return {
            colors: applyAccent(getColors(scheme), accentColor),
            scheme,
            mode,
            isDark: scheme === 'dark',
        };
    }, [mode, systemScheme, accentColor]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
    return useContext(ThemeContext);
}
