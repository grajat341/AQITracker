/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        primary: {
          50: '#f0f6ff',
          100: '#dce9ff',
          200: '#b8d3ff',
          300: '#93bcff',
          400: '#6fa6ff',
          500: '#4b90ff',
          600: '#1f6ce6',
          700: '#154eb0',
          800: '#0c337a',
          900: '#041d44'
        }
      }
    }
  },
  plugins: []
};
