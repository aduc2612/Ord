import { useColorScheme } from 'react-native';
import { createTheme } from '@/constants/theme';

export type Theme = ReturnType<typeof createTheme>;

export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  return createTheme(isDark);
}
