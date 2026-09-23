/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        axiom: {
          bg: '#08090d',
          surface: '#0e111a',
          card: 'rgba(18, 22, 34, 0.75)',
          border: 'rgba(255, 255, 255, 0.08)',
          glow: '#00f0ff',
          neon: '#7928ca',
          accent: '#00d2ff',
          danger: '#ff3366',
          warning: '#f5a623',
          success: '#00e676',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
    },
  },
  plugins: [],
};
