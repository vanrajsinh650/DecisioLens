import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ['"Pixelify Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
        body: ['"Plus Jakarta Sans"', "sans-serif"],
        pixel: ['"Silkscreen"', "monospace"],
        data: ['"VT323"', "monospace"],
      },
      colors: {
        s0: "#03030A",
        s1: "#07070F",
        s2: "#0B0B18",
        s3: "#101022",
        rim: "#1A1A30",
        "a-green": {
          DEFAULT: "hsl(145, 65%, 44%)",
          surface: "hsl(145, 36%, 9%)",
        },
        "a-violet": {
          DEFAULT: "hsl(265, 65%, 62%)",
          surface: "hsl(265, 36%, 9%)",
        },
        "a-teal": {
          DEFAULT: "hsl(172, 60%, 48%)",
          surface: "hsl(172, 33%, 9%)",
        },
        "a-crimson": {
          DEFAULT: "hsl(350, 68%, 56%)",
          surface: "hsl(350, 38%, 9%)",
        },
        "a-amber": {
          DEFAULT: "hsl(38, 82%, 52%)",
          surface: "hsl(38, 45%, 9%)",
        },
        t1: "#ECEAF8",
        t2: "#7070A0",
        t3: "#3A3A58",
        t4: "#1E1E30",
      },
      fontSize: {
        verdict: ["clamp(1.8rem, 3.5vw, 2.6rem)", { lineHeight: "1.1", fontWeight: "800" }],
        hero: ["clamp(2.5rem, 5.4vw, 4.1rem)", { lineHeight: "1.08", fontWeight: "800" }],
        h1: ["1.75rem", { lineHeight: "1.2", fontWeight: "600" }],
        h2: ["1.125rem", { lineHeight: "1.3", fontWeight: "600" }],
        label: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.12em", fontWeight: "600" }],
        body: ["0.9375rem", { lineHeight: "1.75" }],
        mono: ["0.875rem", { lineHeight: "1.6" }],
        micro: ["0.75rem", { lineHeight: "1.4" }],
      },
      spacing: {
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "6": "24px",
        "7": "28px",
        "8": "32px",
        "12": "48px",
        "16": "64px",
        "24": "96px",
      },
      borderRadius: {
        card: "10px",
        inset: "4px",
      },
      boxShadow: {
        dark: "0 2px 8px rgba(0, 0, 0, 0.5)",
        "cta-glow": "0 16px 40px hsl(265, 65%, 62%, 0.22)",
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
