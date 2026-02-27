export const COLORS = {
    primary: '#6C63FF',
    primaryLight: '#8B84FF',
    primaryDark: '#4D44DB',
    secondary: '#FF6584',
    accent: '#43CFBA',
    accentOrange: '#FF9A3C',

    // Backgrounds
    background: '#0F0F1A',
    surface: '#1A1A2E',
    surfaceLight: '#252540',
    card: '#1E1E35',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0C0',
    textMuted: '#606080',

    // Status
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',

    // Badge tier colors
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',

    // Habit palette
    habitColors: [
        '#6C63FF', '#FF6584', '#43CFBA', '#FF9A3C',
        '#A855F7', '#06B6D4', '#F59E0B', '#10B981',
        '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899',
    ],

    // Transparent
    overlay: 'rgba(0,0,0,0.6)',
    cardBorder: 'rgba(255,255,255,0.08)',
};

export const TYPOGRAPHY = {
    // Font sizes
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 42,

    // Font weights
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    section: 40,
};

export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
};

export const SHADOWS = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    glow: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    }),
};
