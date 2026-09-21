/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#B90F0F',
        'primary-dark': '#8a0b0b',
      },
    },
  },
  plugins: [],
}