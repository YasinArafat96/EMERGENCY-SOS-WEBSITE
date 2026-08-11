/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sos-red': '#dc2626',
        'sos-dark': '#1a1a2e',
        'sos-gray': '#2d2d44',
      },
    },
  },
  plugins: [],
}