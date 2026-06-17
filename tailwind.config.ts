import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light institutional fintech palette (Kalshi/Polymarket-inspired).
        // `ink` is the SURFACE scale: 900 = page background, 800 = card, etc.
        ink: {
          900: "#f4f6fa",
          800: "#ffffff",
          700: "#f3f5f9",
          600: "#eaeef4",
          500: "#dee4ed"
        },
        line: "#e3e8f0",
        // text
        body: "#0c1322",
        muted: "#5b6678",
        brand: {
          DEFAULT: "#2563eb",
          600: "#1d4ed8",
          50: "#eff5ff"
        },
        yes: {
          DEFAULT: "#0f9d6b",
          50: "#e7f7f0"
        },
        no: {
          DEFAULT: "#e0233a",
          50: "#fdeaec"
        },
        warn: {
          DEFAULT: "#b45309",
          50: "#fdf3e7"
        }
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"]
      },
      borderRadius: {
        xl: "0.875rem"
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)",
        pop: "0 8px 24px rgba(16,24,40,0.10)"
      }
    }
  },
  plugins: []
};

export default config;
