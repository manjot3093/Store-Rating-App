/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#161A23',
        canvas: '#F6F5F1',
        slate: {
          850: '#1c2333',
        },
        brand: {
          50: '#eef4ff',
          100: '#dbe7fe',
          200: '#bfd6fe',
          300: '#93bafc',
          400: '#5f96f8',
          500: '#3a72f0',
          600: '#2454e0',
          700: '#1d42bd',
          800: '#1c3899',
          900: '#1c3279',
        },
        clay: {
          400: '#e18d5f',
          500: '#d1723f',
          600: '#b35a2e',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(22,26,35,0.04), 0 8px 24px -12px rgba(22,26,35,0.15)',
      },
    },
  },
  plugins: [],
};
