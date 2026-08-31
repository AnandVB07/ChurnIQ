/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#08070B',
          surface: '#111019',
          secondary: '#171421',
          border: '#2A2435',
          text: '#F5F3FF',
          muted: '#A6A1B5',
        },
        light: {
          bg: '#F8F7FC',
          surface: '#FFFFFF',
          secondary: '#F1EEF7',
          border: '#E7E2EF',
          text: '#17131F',
          muted: '#6B6575',
        },
        brand: {
          primary: '#A855F7',
          bright: '#C026FF',
          secondary: '#7C3AED',
          accent: '#9333EA',
          glow: 'rgba(192, 38, 255, 0.15)',
        },
        risk: {
          low: '#10B981',
          medium: '#F59E0B',
          high: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px -3px rgba(192, 38, 255, 0.25)',
        'neon-subtle': '0 0 12px -2px rgba(168, 85, 247, 0.18)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'card-light': '0 4px 20px -2px rgba(124, 58, 237, 0.06)',
      }
    },
  },
  plugins: [],
}
