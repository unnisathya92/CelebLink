import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0e1a",
        surface: "#131827",
        border: "#1e293b",
        text: "#f1f5f9",
        muted: "#94a3b8",
        accent: "#6366f1",
        accentHover: "#4f46e5",
        maleStick: "#3b82f6",
        femaleStick: "#ec4899",
      },
      boxShadow: {
        'glow': '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.2)',
      },
    },
  },
  plugins: [],
};
export default config;
