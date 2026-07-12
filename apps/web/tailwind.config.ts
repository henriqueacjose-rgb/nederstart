import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "../../packages/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#12382E",
          secondary: "#2F6F8F",
          accent: "#E9823A",
          background: "#FAFAF7",
          surface: "#FFFFFF",
          text: "#17211D",
          muted: "#5E6B64",
          border: "#DDE5DF",
          success: "#2E7D5B",
          error: "#B84040",
          warning: "#C97822"
        }
      },
      borderRadius: {
        component: "8px"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(18, 56, 46, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
