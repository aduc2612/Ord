import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_STORAGE_KEY = "ord-theme-preference";

export type ThemePreference = "system" | "light" | "dark";

type ThemeState = {
  preference: ThemePreference;
};

type ThemeActions = {
  setThemePreference: (preference: ThemePreference) => void;
};

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set) => ({
      preference: "system" as ThemePreference,
      setThemePreference: (preference) => set({ preference }),
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
