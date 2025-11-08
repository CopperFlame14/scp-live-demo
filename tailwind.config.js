/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        primary: {
          100: "#a5f3fc",
          500: "#06b6d4",
          700: "#0e7490"
        },
        dark: {
          900: "#0f172a",
          800: "#1e293b",
          700: "#334155"
        }
      }
    }
  },
  plugins: [],
};
