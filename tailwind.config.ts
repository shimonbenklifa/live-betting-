import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Institutional fintech dark palette
        ink: {
          900: "#0a0c10",
          800: "#0e1117",
          700: "#141821",
          600: "#1b212c",
          500: "#252c3a"
        },
        line: "#222937",
        muted: "#8a93a6",
        brand: {
          DEFAULT: "#3b82f6",
          600: "#2563eb"
        },
        yes: "#19c37d",
        no: "#ef4d56",
        warn: "#f5a623"
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"]
      },
      borderRadius: {
        xl: "0.875rem"
      }
    }
  },
  plugins: []
};

export default config;
