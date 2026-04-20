import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Manrope", "ui-sans-serif", "system-ui"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        // Neutral canvas (AI control room feel)
        ink: {
          950: "#07090d",
          900: "#0b0e14",
          800: "#11151d",
          700: "#171c27",
          600: "#1f2635",
          500: "#2a3245",
          400: "#3a4358",
          300: "#5b6480",
          200: "#8a92a8",
          100: "#c6cbd9",
          50: "#e9ecf2",
        },
        // Semantic signal colors
        signal: {
          stable: "#22c55e",    // green
          stableSoft: "#16351f",
          caution: "#f59e0b",   // amber
          cautionSoft: "#3a2a0d",
          risk: "#ef4444",      // red
          riskSoft: "#3a1414",
          info: "#3b82f6",      // blue
          infoSoft: "#10223d",
        },
        accent: {
          DEFAULT: "#7c9cff",
          muted: "#2b3553",
        },
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 1px 2px rgba(0,0,0,0.35)",
        lift: "0 10px 30px -12px rgba(0,0,0,0.6)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
