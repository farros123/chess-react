/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chess-light': '#e8d5b7',
        'chess-dark': '#b58863',
        'chess-selected': '#f7ec59',
        'chess-bg': '#1a1a2e',
      },
      fontFamily: {
        'dm': ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}