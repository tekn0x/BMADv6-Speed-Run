import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#ffffff",
        border: "#222222",
        primary: "#3b82f6",
        surface: "#1a1a1a",
        error: "#ef4444",
        success: "#10b981",
        card: {
          DEFAULT: "#1a1a1a",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#1a1a1a",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#222222",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#666666",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#3b82f6",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        input: "#222222",
        ring: "#3b82f6",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
