import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand — Principal (electric blue)
        brand: {
          50: "#E9F2FF",
          100: "#C0DEFF",
          400: "#0062FF",
          500: "#0001F6",
          700: "#0001AF",
          900: "#000067",
          DEFAULT: "#0001F6",
        },
        cian: "#04C8FE",
        // Foundation/Correct/700 — indicadores positivos (dólar al alza)
        correct: "#6DB500",
        // Red
        red: {
          500: "#FF0100",
          soft: "#EE6B5F",
          DEFAULT: "#FF0100",
        },
        // Neutral scale (from Foundation/White)
        ink: {
          900: "#1E1E1E",
          800: "#2A2A2A",
          700: "#323232",
          500: "#474747",
          400: "#6C6C6C",
          300: "#848484",
          200: "#AAAAAA",
          100: "#C6C6C6",
          50: "#F2F2F2",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F0F3F6",
          soft: "#F2EEF6",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        heading: ["var(--font-oswald)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        pill: "999px",
      },
      maxWidth: {
        container: "1464px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(16, 24, 40, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
