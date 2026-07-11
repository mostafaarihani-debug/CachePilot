/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        app: "rgb(var(--color-bg) / <alpha-value>)",
        "app-elevated": "rgb(var(--color-bg-elevated) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-2": "rgb(var(--color-surface-2) / <alpha-value>)",
        "surface-3": "rgb(var(--color-surface-3) / <alpha-value>)",
        txt: "rgb(var(--color-text) / <alpha-value>)",
        "txt-secondary": "rgb(var(--color-text-secondary) / <alpha-value>)",
        "txt-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
        "txt-disabled": "rgb(var(--color-text-disabled) / <alpha-value>)",
        bdr: "rgb(var(--color-border) / <alpha-value>)",
        "bdr-strong": "rgb(var(--color-border-strong) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0, 0, 0, 0.18)",
        glow: "0 0 0 1px rgba(77, 163, 255, 0.18), 0 10px 30px rgba(77, 163, 255, 0.12)",
        "glow-green": "0 0 0 1px rgba(56, 210, 122, 0.18), 0 10px 30px rgba(56, 210, 122, 0.12)",
        "glow-amber": "0 0 0 1px rgba(245, 184, 74, 0.18), 0 10px 30px rgba(245, 184, 74, 0.12)",
        "glow-red": "0 0 0 1px rgba(255, 107, 107, 0.18), 0 10px 30px rgba(255, 107, 107, 0.12)",
      },
    },
  },
  plugins: [],
};