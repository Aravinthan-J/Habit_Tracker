import * as Haptics from 'expo-haptics';

export const useHaptics = () => {
    const triggerHaptic = (type: 'impactLight' | 'impactMedium' | 'impactHeavy' | 'notification' | 'selection' | 'success' | 'warning' | 'error') => {
        switch (type) {
            case 'impactLight':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                break;
            case 'impactMedium':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                break;
            case 'impactHeavy':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                break;
            case 'success':
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                break;
            case 'warning':
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                break;
            case 'error':
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                break;
            case 'selection':
                Haptics.selectionAsync();
                break;
            default:
                Haptics.selectionAsync();
        }
    };

    return { triggerHaptic };
};
