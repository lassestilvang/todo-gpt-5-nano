/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './ui/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5faff',
          100: '#e6f2ff',
          200: '#cfe0ff',
          300: '#a8ccff',
          400: '#6fb7ff',
          500: '#339aff',
          600: '#1e7bdc',
          700: '#1a5fb3',
          800: '#174d8a',
          900: '#11305a'
        }
      }
    }
  },
  plugins: []
}
