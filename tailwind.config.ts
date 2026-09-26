import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF0FF",
          100: "#DDE1FF",
          200: "#BAC1FF",
          300: "#8C96FA",
          400: "#5A66EE",
          500: "#2F3AE0",
          600: "#1016D1",
          700: "#0D12A8",
          800: "#0B0F82",
          900: "#090C5E",
        },
        navy: {
          50: "#F4F6FB",
          100: "#E6EAF3",
          200: "#CBD2E3",
          300: "#A3AEC9",
          400: "#5C6A90",
          500: "#4C5A7E",
          600: "#364264",
          700: "#26304D",
          800: "#172038",
          900: "#0B1330",
        },
        canvas: "#F7F8FC",
        /** Very soft blue-grey section wash from the selected mockup. */
        wash: "#F3F6FD",
        success: { 50: "#ECFDF3", 500: "#16A34A", 600: "#12805C", 700: "#0B6446" },
        warning: { 50: "#FFF7E6", 600: "#B45309", 700: "#92400E" },
        danger: { 50: "#FEF1F2", 500: "#DC2626", 600: "#C0263A" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      borderRadius: {
        card: "20px",
        xl2: "24px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,19,48,0.04), 0 8px 24px -12px rgba(11,19,48,0.12)",
        lift: "0 2px 4px rgba(11,19,48,0.04), 0 20px 40px -20px rgba(16,22,209,0.28)",
        float: "0 1px 2px rgba(11,19,48,0.04), 0 24px 48px -24px rgba(11,19,48,0.22)",
      },
      maxWidth: { page: "1200px" },
    },
  },
  plugins: [],
};

export default config;
