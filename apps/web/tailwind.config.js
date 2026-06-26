/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#1e2a78",
          blue: "#2f6fed",
          sky: "#39a0e0",
          honey: "#e8a23d",
          gold: "#c98a16"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "sans-serif"]
      }
    }
  },
  plugins: []
};
