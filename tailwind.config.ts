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
        korf: {
          primary: "#1e3a8a",   // Blue primary
          secondary: "#0284c7", // Sky blue
          accent: "#f59e0b",    // Yellow / Amber
          success: "#10b981",   // Emerald
          danger: "#ef4444",    // Red
          dark: "#0f172a",      // Slate 900
        },
      },
    },
  },
  plugins: [],
};
export default config;
