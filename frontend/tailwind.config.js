/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#1b1b1b",
          charcoal: "#242424",
          gold: "#b58e58",
          "gold-light": "#d8bc88",
          cream: "#faf9f6",
          muted: "#737373",
          border: "#e5e5e5",
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


