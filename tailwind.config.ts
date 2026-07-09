import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: "var(--primary-dark)",
          main: "var(--primary-main)",
          light: "var(--primary-light)",
        },
        secondary: {
          dark: "var(--secondary-dark)",
          main: "var(--secondary-main)",
          light: "var(--secondary-light)",
        },
        text: {
          primary: "var(--foreground)",
          secondary: "var(--muted)",
        },
      },

      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
      },

      keyframes: {
        shimmer: {
          "0%": {
            transform: "translateX(-120%) skewX(-20deg)",
            opacity: "0",
          },
          "30%": { opacity: "1" },
          "100%": {
            transform: "translateX(220%) skewX(-20deg)",
            opacity: "0",
          },
        },

        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },

        glow: {
          "0%,100%": { boxShadow: "0 0 0 rgba(255,255,255,0)" },
          "50%": { boxShadow: "0 0 24px rgba(19,152,212,0.18)" },
        },
      },

      animation: {
        shimmer: "shimmer 4.5s ease-in-out infinite",
        float: "float 5s ease-in-out infinite",
        glow: "glow 3.5s ease-in-out infinite",
      },

      
    },
  },
  plugins: [],
};

export default config;