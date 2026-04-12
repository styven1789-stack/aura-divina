import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#fff5f8',
          100: '#ffe6ee',
          150: '#fcd9e3',
          200: '#fbcad8',
          300: '#f5a4bf',
          400: '#ef7ba2',
          500: '#e85585',
          600: '#cf3a6d',
        },
        gold: {
          300: '#e3c98e',
          400: '#d4b572',
          500: '#c9a96e',
          600: '#a8884f',
          700: '#866a36',
        },
        ink: {
          900: '#0c0a0c',
          800: '#1a1518',
          700: '#2a2226',
          600: '#3d3338',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px -10px rgba(207, 58, 109, 0.18)',
        gold: '0 6px 24px -8px rgba(201, 169, 110, 0.45)',
      },
      letterSpacing: {
        widest2: '0.28em',
      },
    },
  },
  plugins: [],
};

export default config;
