/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#0a0a0a',
          900: '#1a1a1a',
          800: '#262626',
          700: '#333333',
          600: '#525252',
          500: '#737373',
          400: '#a3a3a3',
          300: '#d4d4d4',
          200: '#e5e7eb',
          100: '#f5f5f5',
          50: '#fafafa',
        },
      },
      boxShadow: {
        'custom-light': '0 0 15px rgba(255, 255, 255, 0.08)',
        'custom-dark': '0 0 25px rgba(0, 0, 0, 0.25)',
        'interactive': '0 0 10px rgba(99, 102, 241, 0.6)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideInFromTop: {
          '0%': { transform: 'translateY(-20%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.4), 0 0 15px rgba(99, 102, 241, 0.2)' },
          '50%': { boxShadow: '0 0 10px rgba(99, 102, 241, 0.6), 0 0 25px rgba(99, 102, 241, 0.4)' },
        },
        slideInFromTopModal: {
          '0%': { transform: 'translateY(-50px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-in-top': 'slideInFromTop 0.6s ease-out forwards',
        'glow-pulse': 'glow 2s infinite alternate',
        'slide-in-top-modal': 'slideInFromTopModal 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}

