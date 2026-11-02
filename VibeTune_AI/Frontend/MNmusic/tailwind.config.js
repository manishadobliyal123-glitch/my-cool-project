/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      spacing: {
        '18': '4.5rem',
        '19': '4.75rem',
        '75': '18.75rem',
        '85': '21.25rem',
        '100': '25rem',
        '125': '31.25rem',
        '137.5': '34.375rem',
        '150': '37.5rem',
      },
    },
  },
  plugins: [],
  // Suppress warnings about gradient class naming conventions
  safelist: [
    'bg-gradient-to-br',
    'bg-gradient-to-r',
    'bg-gradient-to-tr',
    'bg-linear-to-br',
    'bg-linear-to-r',
    'bg-linear-to-tr',
  ],
}
