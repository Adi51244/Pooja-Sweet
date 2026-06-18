/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFBF5',
          100: '#FFF5E6',
          200: '#FFE8CC',
        },
        honey: {
          400: '#F5A623',
          500: '#E8910A',
          600: '#C97808',
        },
        rose: {
          300: '#F4A6B8',
          400: '#E8899E',
          500: '#D96B84',
        },
        cocoa: {
          600: '#6B4226',
          700: '#4A2C17',
          800: '#2E1A0E',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(107, 66, 38, 0.08)',
        glow: '0 0 30px rgba(245, 166, 35, 0.25)',
      },
    },
  },
  plugins: [],
};
