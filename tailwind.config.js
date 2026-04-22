/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#10b981', // Emerald 500
        secondary: '#064e3b', // Emerald 900
        brand: {
          dark: '#022c22', // Emerald 950
          light: '#f0fdf4', // Emerald 50
          accent: '#fbbf24', // Amber 400 (for highlights)
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
