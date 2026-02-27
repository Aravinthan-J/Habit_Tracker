import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export function useHaptics() {
    const success = useCallback(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
    }, []);

    const warning = useCallback(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => { });
    }, []);

    const error = useCallback(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => { });
    }, []);

    const light = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    }, []);

    const medium = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
    }, []);

    const heavy = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => { });
    }, []);

    const selection = useCallback(() => {
        Haptics.selectionAsync().catch(() => { });
    }, []);

    return { success, warning, error, light, medium, heavy, selection };
}
