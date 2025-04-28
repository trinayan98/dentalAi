import { create } from "zustand";

// Get preferred theme from local storage or system preference
const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      return savedTheme;
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return prefersDark ? "dark" : "light";
  }

  return "light";
};

// Apply theme to document
const applyTheme = (theme) => {
  const root = window.document.documentElement;

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    root.classList.remove("light", "dark");
    root.classList.add(systemTheme);
  } else {
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }
};

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),

  setTheme: (theme) => {
    set({ theme });

    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
      applyTheme(theme);
    }
  },
}));

// Initialize theme
if (typeof window !== "undefined") {
  applyTheme(getInitialTheme());

  // Watch for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      const { theme } = useThemeStore.getState();
      if (theme === "system") {
        applyTheme("system");
      }
    });
}
