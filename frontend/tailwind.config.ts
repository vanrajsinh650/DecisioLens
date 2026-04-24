import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
        body: ['"Plus Jakarta Sans"', "sans-serif"],
      },
      colors: {
        s0: "#03030A",
        s1: "#070710",
        s2: "#0C0C1A",
        s3: "#111126",
        rim: "#1C1C32",
        "a-green": {
          DEFAULT: "hsl(145, 65%, 44%)",
          surface: "hsl(145, 40%, 8%)",
        },
        "a-violet": {
          DEFAULT: "hsl(265, 65%, 62%)",
          surface: "hsl(265, 45%, 8%)",
        },
        "a-teal": {
          DEFAULT: "hsl(172, 60%, 48%)",
          surface: "hsl(172, 35%, 8%)",
        },
        "a-crimson": {
          DEFAULT: "hsl(350, 68%, 56%)",
          surface: "hsl(350, 40%, 8%)",
        },
        "a-amber": {
          DEFAULT: "hsl(35, 70%, 50%)",
          surface: "hsl(35, 30%, 8%)",
        },
        t1: "#ECEAF8",
        t2: "#7878A0",
        t3: "#3E3E5A",
        t4: "#1E1E30",
      },
      fontSize: {
        verdict: ["clamp(3rem, 6vw, 4.5rem)", { lineHeight: "1.1", fontWeight: "800" }],
        hero: ["clamp(2.8rem, 5.5vw, 4rem)", { lineHeight: "1.1", fontWeight: "800" }],
        h1: ["1.75rem", { lineHeight: "1.2", fontWeight: "600" }],
        h2: ["1.125rem", { lineHeight: "1.3", fontWeight: "600" }],
        label: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.12em", fontWeight: "600" }],
        body: ["0.9375rem", { lineHeight: "1.8" }],
        mono: ["0.875rem", { lineHeight: "1.6" }],
        micro: ["0.75rem", { lineHeight: "1.4" }],
      },
      spacing: {
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "6": "24px",
        "8": "32px",
        "12": "48px",
        "16": "64px",
        "24": "96px",
      },
      borderRadius: {
        card: "10px",
        inset: "6px",
      },
      boxShadow: {
        dark: "0 2px 8px rgba(0, 0, 0, 0.5)",
        "cta-glow": "0 12px 32px hsl(265, 65%, 62%, 0.22)",
      },
      keyframes: {
        "cursor-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "cursor-pulse": "cursor-pulse 1s step-start infinite",
      },
      transitionDuration: {
        fast: "150ms",
      },
      transitionTimingFunction: {
        fast: "ease",
      },
    },
  },
  plugins: [],
};

export default config;
