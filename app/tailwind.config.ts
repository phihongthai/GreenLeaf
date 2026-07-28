import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gl: {
          green: "#3a7d44",
          "green-dark": "#2e4a34",
          "green-light": "#cdeac0",
          cream: "#f7f4ec",
          gold: "#c9a876",
          muted: "#8a9a8d",
          streak: "#ff7a1a",
        },
      },
      fontFamily: {
        display: ["var(--font-baloo)", "sans-serif"],
        sans: ["var(--font-nunito)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
