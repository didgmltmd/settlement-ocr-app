/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class", // RN에서 'dark' 클래스로 토글
  theme: {
    extend: {
      colors: {
        background: "#fafafa",
        foreground: "#1a1a1a",
        card: "#ffffff",
        "card-foreground": "#1a1a1a",
        popover: "#ffffff", // RN에선 oklch 미지원 → 근사치
        "popover-foreground": "#1a1a1a",

        primary: "#6366f1",
        "primary-foreground": "#ffffff",

        secondary: "#f1f5f9",
        "secondary-foreground": "#334155",

        muted: "#f8fafc",
        "muted-foreground": "#64748b",

        accent: "#f1f5f9",
        "accent-foreground": "#334155",

        destructive: "#ef4444",
        "destructive-foreground": "#ffffff",

        border: "#e2e8f0",
        input: "transparent",
        "input-background": "#f8fafc",
        "switch-background": "#cbd5e1",
        ring: "#6366f1",

        // charts (근사 RGB)
        "chart-1": "#5b7cf2",
        "chart-2": "#4aa6e7",
        "chart-3": "#5163d4",
        "chart-4": "#a8db63",
        "chart-5": "#d1d85a",

        // sidebar
        sidebar: "#fbfbfb",
        "sidebar-foreground": "#1a1a1a",
        "sidebar-primary": "#6366f1",
        "sidebar-primary-foreground": "#ffffff",
        "sidebar-accent": "#f6f6f6",
        "sidebar-accent-foreground": "#334155",
        "sidebar-border": "#e2e8f0",
        "sidebar-ring": "#6366f1",
      },
      borderRadius: {
        sm: "0.5rem", // radius - 4px
        md: "0.625rem", // radius - 2px
        lg: "0.75rem",
        xl: "1rem", // radius + 4px
      },
      fontWeight: {
        normal: "400",
        medium: "500",
      },
      fontSize: {
        base: 16,
        lg: 18,
        xl: 20,
        "2xl": 24,
      },
    },
  },
  plugins: [],
};
