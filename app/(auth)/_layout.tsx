import { Stack } from 'expo-router';
import { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

export default function AuthLayout() {
  const { colors: COLORS } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    />
  );
}
