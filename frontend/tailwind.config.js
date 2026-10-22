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
          bg: '#111817',
          surface: '#18211F',
          secondary: '#202B28',
          border: '#2A3733',
          text: '#EDF3EE',
          muted: '#899B93',
        },
        light: {
          bg: '#F3F6F3',
          surface: '#FFFFFF',
          secondary: '#F6F9F7',
          border: '#E2EAE4',
          text: '#17231D',
          muted: '#718078',
        },
        brand: {
          primary: '#159B75',
          bright: '#54D4AD',
          secondary: '#0D805F',
          accent: '#35B891',
          glow: 'rgba(84, 212, 173, 0.12)',
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
        'neon': '0 0 20px -3px rgba(84, 212, 173, 0.20)',
        'neon-subtle': '0 0 12px -2px rgba(53, 184, 145, 0.15)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'card-light': '0 4px 20px -2px rgba(124, 58, 237, 0.06)',
      }
    },
  },
  plugins: [],
}
