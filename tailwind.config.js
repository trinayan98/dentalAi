/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontSize: {
        xxs: "clamp(0.6rem, 0.7rem + 0.25vw, 0.7rem)", // 12px - 14px
        xs: "clamp(0.65rem, 0.7rem + 0.25vw, 0.775rem)", // 12px - 14px
        sm: "clamp(0.7rem, 0.8rem + 0.375vw, .9rem)", // 14px - 16px
        base: "clamp(1rem, 0.9rem + 0.5vw, 1.125rem)", // 16px - 18px
        lg: "clamp(1.125rem, 1rem + 0.625vw, 1.25rem)", // 18px - 20px
        md: "clamp(.9rem, 2rem + 0.625vw, 1rem)", // 18px - 20px
        xl: "clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)", // 20px - 24px
        p1: "clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)", // 20px - 24px
        "2xl": "clamp(1.5rem, 1.3rem + 1vw, 2rem)", // 24px - 32px
        "3xl": "clamp(1.875rem, 1.5rem + 1.5vw, 2.5rem)", // 30px - 40px
        "4xl": "clamp(1.5rem, 1rem + 2vw, 2.5rem)", // 36px - 48px
        "5xl": "clamp(3rem, 2.4rem + 3vw, 4rem)", // 48px - 64px
        "6xl": "clamp(3.75rem, 3rem + 3.75vw, 5rem)", // 60px - 80px
        "7xl": "clamp(4.5rem, 3.6rem + 4.5vw, 6rem)", // 72px - 96px
        "8xl": "clamp(6rem, 4.8rem + 6vw, 8rem)", // 96px - 128px
        "9xl": "clamp(8rem, 6.4rem + 8vw, 10rem)", // 128px - 160px
      },
      colors: {
        primary: {
          50: "#e6efff", // very light blue
          100: "#ccdfff",
          200: "#99bfff",
          300: "#669fff",
          400: "#3380ff",
          500: "#0052ff", // your main color
          600: "#0049e6",
          700: "#003fcc",
          800: "#0036b3",
          900: "#002080",
          950: "#00114d",
        },

        secondary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b", // Accent orange
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712",
        },
      },
      fontFamily: {
        sans: ["Inter"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
