import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreference = "light" | "dark";

interface ThemeState {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

function normalizeTheme(theme: unknown): ThemePreference {
  return theme === "dark" ? "dark" : "light";
}

function applyThemeClass(theme: ThemePreference) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => {
        applyThemeClass(theme);
        set({ theme });
      },
    }),
    {
      name: "iras-theme",
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const theme = normalizeTheme(state.theme);
        applyThemeClass(theme);
        if (state.theme !== theme) {
          state.setTheme(theme);
        }
      },
    },
  ),
);
