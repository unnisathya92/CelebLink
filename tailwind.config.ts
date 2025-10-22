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
        bg: "#0b0f19",
        surface: "#0f1424",
        border: "#1f2a44",
        text: "#e6e6f0",
        muted: "#9aa4bd",
        accent: "#8b5cf6",
        maleStick: "#3b82f6",
        femaleStick: "#ec4899",
      },
    },
  },
  plugins: [],
};
export default config;
