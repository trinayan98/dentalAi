import React from "react";
import { useThemeStore } from "../stores/themeStore";
import { Sun, Moon, Monitor } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";

export const ThemeToggle = () => {
  const { theme, setTheme } = useThemeStore();

  const toggle = () => {
    switch (theme) {
      case "light":
        setTheme("dark");
        break;
      case "dark":
        setTheme("system");
        break;
      default:
        setTheme("light");
        break;
    }
  };

  return (
    <button
      onClick={toggle}
      className={clsx(
        "rounded-full p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      )}
      aria-label="Toggle theme"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -20, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 20, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {theme === "light" && <Sun className="h-5 w-5" />}
        {theme === "dark" && <Moon className="h-5 w-5" />}
        {theme === "system" && <Monitor className="h-5 w-5" />}
      </motion.div>
    </button>
  );
};
