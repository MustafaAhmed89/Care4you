import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefdfb",
          100: "#d5f7f2",
          200: "#aeeee7",
          300: "#77ded6",
          400: "#3cc5bf",
          500: "#1aa8a4",
          600: "#0f8785",
          700: "#116b6b",
          800: "#135556",
          900: "#144748",
          950: "#052a2c",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
