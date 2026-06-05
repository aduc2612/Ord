import { create } from "zustand";

export type ThemePreference = "system" | "light" | "dark";

type ThemeState = {
  preference: ThemePreference;
};

type ThemeActions = {
  setThemePreference: (preference: ThemePreference) => void;
};

export const useThemeStore = create<ThemeState & ThemeActions>()((set) => ({
  preference: "system",
  setThemePreference: (preference) => set({ preference }),
}));
