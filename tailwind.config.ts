import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tron: {
          orange: "#FF6A00",
          "orange-dim": "#CC5500",
          "orange-light": "#FF8C42",
          "bg-primary": "#0a0a0f",
          "bg-secondary": "#111118",
          "bg-card": "#16161f",
          "text-primary": "#e8e8ef",
          "text-secondary": "#8888a0",
          green: "#00E676",
          red: "#FF1744",
          cyan: "#00E5FF",
        },
      },
      fontFamily: {
        heading: ["var(--font-orbitron)", "sans-serif"],
        mono: ["var(--font-share-tech)", "monospace"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        "tron-glow":
          "0 0 10px rgba(255,106,0,0.3), 0 0 20px rgba(255,106,0,0.15), 0 0 40px rgba(255,106,0,0.05)",
        "tron-glow-strong":
          "0 0 10px rgba(255,106,0,0.5), 0 0 30px rgba(255,106,0,0.3), 0 0 60px rgba(255,106,0,0.1)",
        "tron-glow-green":
          "0 0 8px rgba(0,230,118,0.4), 0 0 20px rgba(0,230,118,0.15)",
        "tron-glow-red":
          "0 0 8px rgba(255,23,68,0.4), 0 0 20px rgba(255,23,68,0.15)",
      },
      animation: {
        "tron-pulse": "tronPulse 4s ease-in-out infinite",
        "tron-spin": "spin 30s linear infinite",
        "fade-in": "fadeIn 200ms ease-out",
        "slide-up": "slideUp 300ms ease-out",
        "count-up": "fadeIn 150ms ease-out",
        "glow-breathe": "glowBreathe 3s ease-in-out infinite",
        ripple: "ripple 0.6s ease-out forwards",
        "skeleton-pulse": "skeletonPulse 1.8s ease-in-out infinite",
        "spin-ring": "spinRing 1s linear infinite",
      },
      keyframes: {
        tronPulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowBreathe: {
          "0%, 100%": {
            boxShadow:
              "0 0 10px rgba(255,106,0,0.3), 0 0 20px rgba(255,106,0,0.15)",
          },
          "50%": {
            boxShadow:
              "0 0 15px rgba(255,106,0,0.5), 0 0 30px rgba(255,106,0,0.25)",
          },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.6" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        skeletonPulse: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
        spinRing: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      borderColor: {
        tron: "rgba(255,106,0,0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
