/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Taj-inspired luxury color palette
        primary: {
          50: '#fdf8f3',
          100: '#f9ede0',
          200: '#f2d9bf',
          300: '#e9be94',
          400: '#df9d66',
          500: '#d68245',
          600: '#c86a3a',
          700: '#a65332',
          800: '#85442e',
          900: '#6c3928',
          950: '#3a1b12',
        },
        secondary: {
          50: '#f6f5f0',
          100: '#e8e6da',
          200: '#d3cfb8',
          300: '#bab38f',
          400: '#a59a6e',
          500: '#968960',
          600: '#816f51',
          700: '#695843',
          800: '#59493c',
          900: '#4d4037',
          950: '#2b221c',
        },
        luxury: {
          gold: '#c9a227',
          bronze: '#cd7f32',
          cream: '#fffdd0',
          maroon: '#4a1c2b',
          charcoal: '#36454f',
        },
        // Custom dark theme
        dark: {
          bg: '#0f0f0f',
          card: '#1a1a1a',
          border: '#2a2a2a',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'zoom-in': 'zoomIn 0.4s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'luxury-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        'gold-gradient': 'linear-gradient(135deg, #c9a227 0%, #daa520 50%, #b8860b 100%)',
      },
    },
  },
  plugins: [],
}
