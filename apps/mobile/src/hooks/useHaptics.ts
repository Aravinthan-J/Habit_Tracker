import * as Haptics from 'expo-haptics';

export const useHaptics = () => {
  const trigger = (type: Haptics.ImpactFeedbackStyle) => {
    Haptics.impactAsync(type);
  };

  const notify = (type: Haptics.NotificationFeedbackType) => {
    Haptics.notificationAsync(type);
  };

  return {
    light: () => trigger(Haptics.ImpactFeedbackStyle.Light),
    medium: () => trigger(Haptics.ImpactFeedbackStyle.Medium),
    heavy: () => trigger(Haptics.ImpactFeedbackStyle.Heavy),
    success: () => notify(Haptics.NotificationFeedbackType.Success),
    warning: () => notify(Haptics.NotificationFeedbackType.Warning),
    error: () => notify(Haptics.NotificationFeedbackType.Error),
  };
};
