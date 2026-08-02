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
      /* Escala tipográfica atada a --font-scale (globals.css), que en
         escritorio vale 0.9. Se toca aquí y no en el tamaño raíz del html
         porque los espaciados de Tailwind también van en rem: bajando la raíz
         se encogerían márgenes y altos, y el calce con Figma se rompería.
         Las alturas de línea son sin unidad para que sigan al tamaño. */
      fontSize: {
        xs: ["calc(0.75rem * var(--font-scale, 1) * var(--font-user-scale, 1))", { lineHeight: "1.35" }],
        sm: ["calc(0.875rem * var(--font-scale, 1) * var(--font-user-scale, 1))", { lineHeight: "1.45" }],
        base: ["calc(1rem * var(--font-scale, 1) * var(--font-user-scale, 1))", { lineHeight: "1.5" }],
        lg: ["calc(1.125rem * var(--font-scale, 1) * var(--font-user-scale, 1))", { lineHeight: "1.55" }],
        xl: ["calc(1.25rem * var(--font-scale, 1) * var(--font-user-scale, 1))", { lineHeight: "1.4" }],
        "2xl": ["calc(1.5rem * var(--font-scale, 1) * var(--font-user-scale, 1))", { lineHeight: "1.33" }],
        "3xl": ["calc(1.875rem * var(--font-scale, 1) * var(--font-user-scale, 1))", { lineHeight: "1.2" }],
        "4xl": ["calc(2.25rem * var(--font-scale, 1) * var(--font-user-scale, 1))", { lineHeight: "1.11" }],
        "5xl": ["calc(3rem * var(--font-scale, 1) * var(--font-user-scale, 1))", { lineHeight: "1.05" }],
        "6xl": ["calc(3.75rem * var(--font-scale, 1) * var(--font-user-scale, 1))", { lineHeight: "1" }],
        "7xl": ["calc(4.5rem * var(--font-scale, 1) * var(--font-user-scale, 1))", { lineHeight: "1" }],
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
