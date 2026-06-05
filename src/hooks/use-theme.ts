import { useMemo } from "react";
import { useColorScheme } from "react-native";
import { createTheme } from "@/constants/theme";
import { useThemeStore } from "@/store/theme-store";

export type Theme = ReturnType<typeof createTheme>;

export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  const preference = useThemeStore((s) => s.preference);

  const isDark = useMemo(() => {
    if (preference === "light") return false;
    if (preference === "dark") return true;
    return colorScheme === "dark";
  }, [preference, colorScheme]);

  return useMemo(() => createTheme(isDark), [isDark]);
}
