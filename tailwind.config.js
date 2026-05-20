/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
          light: '#818cf8',
        },
        dark: {
          DEFAULT: '#0f172a',
          lighter: '#1e293b',
          lightest: '#334155',
        },
        accent: {
          DEFAULT: '#f43f5e',
          glow: 'rgba(244, 63, 94, 0.5)',
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          'from': { 'box-shadow': '0 0 5px #f43f5e, 0 0 10px #f43f5e' },
          'to': { 'box-shadow': '0 0 20px #f43f5e, 0 0 30px #f43f5e' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
