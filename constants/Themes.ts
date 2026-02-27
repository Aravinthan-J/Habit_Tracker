export type PremiumTheme = {
    id: string;
    name: string;
    colors: {
        primary: string;
        primaryLight: string;
        primaryDark: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        surfaceLight: string;
        card: string;
        textPrimary: string;
        textSecondary: string;
        textMuted: string;
        success: string;
        cardBorder: string;
    };
};

export const PREMIUM_THEMES: Record<string, PremiumTheme> = {
    deep_sea: {
        id: 'deep_sea',
        name: 'Deep Sea',
        colors: {
            primary: '#0077b6',
            primaryLight: '#00b4d8',
            primaryDark: '#03045e',
            secondary: '#48cae4',
            accent: '#ade8f4',
            background: '#023047',
            surface: '#05445e',
            surfaceLight: '#189ab4',
            card: '#05445e',
            textPrimary: '#ffffff',
            textSecondary: '#d1f2fb',
            textMuted: '#75e6da',
            success: '#4CAF50',
            cardBorder: 'rgba(255,255,255,0.08)',
        },
    },
    midnight_spark: {
        id: 'midnight_spark',
        name: 'Midnight Spark',
        colors: {
            primary: '#7b2cbf',
            primaryLight: '#9d4edd',
            primaryDark: '#3c096c',
            secondary: '#e0aaff',
            accent: '#ff9e00',
            background: '#10002b',
            surface: '#240046',
            surfaceLight: '#3c096c',
            card: '#240046',
            textPrimary: '#ffffff',
            textSecondary: '#e0aaff',
            textMuted: '#9d4edd',
            success: '#4CAF50',
            cardBorder: 'rgba(255,255,255,0.08)',
        },
    },
    forest_mist: {
        id: 'forest_mist',
        name: 'Forest Mist',
        colors: {
            primary: '#2d6a4f',
            primaryLight: '#52b788',
            primaryDark: '#081c15',
            secondary: '#d8f3dc',
            accent: '#ffb703',
            background: '#1b4332',
            surface: '#2d6a4f',
            surfaceLight: '#40916c',
            card: '#2d6a4f',
            textPrimary: '#ffffff',
            textSecondary: '#b7e4c7',
            textMuted: '#95d5b2',
            success: '#4CAF50',
            cardBorder: 'rgba(255,255,255,0.08)',
        },
    },
    sunset_gold: {
        id: 'sunset_gold',
        name: 'Sunset Gold',
        colors: {
            primary: '#e63946',
            primaryLight: '#f1faee',
            primaryDark: '#a8dadc',
            secondary: '#457b9d',
            accent: '#ffb703',
            background: '#1d3557',
            surface: '#457b9d',
            surfaceLight: '#a8dadc',
            card: '#457b9d',
            textPrimary: '#ffffff',
            textSecondary: '#f1faee',
            textMuted: '#a8dadc',
            success: '#4CAF50',
            cardBorder: 'rgba(255,255,255,0.08)',
        },
    },
};
