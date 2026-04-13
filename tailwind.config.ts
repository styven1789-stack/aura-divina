import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#fff5f8',
          75: '#fff0f5',
          100: '#ffe6ee',
          150: '#fcd9e3',
          200: '#fbcad8',
          300: '#f5a4bf',
          400: '#ef7ba2',
          500: '#e85585',
          600: '#cf3a6d',
        },
        // "gold" conserva los nombres por compatibilidad, recalibrado hacia
        // rose-gold/copper cálido para empatar con el metal del logo nuevo.
        gold: {
          300: '#eed4b0',
          400: '#e0b68a',
          500: '#c89372',
          600: '#9a6a47',
          700: '#6f4a2e',
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
        gold: '0 6px 24px -8px rgba(200, 147, 114, 0.45)',
        luxe: '0 20px 60px -20px rgba(200, 147, 114, 0.35)',
        float: '0 8px 30px -8px rgba(26, 21, 24, 0.12)',
      },
      letterSpacing: {
        widest2: '0.28em',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        float: 'float 3s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;
