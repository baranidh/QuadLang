/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        tamil: {
          DEFAULT: '#F97316',
          light: '#FFF7ED',
          border: '#FB923C',
        },
        english: {
          DEFAULT: '#3B82F6',
          light: '#EFF6FF',
          border: '#60A5FA',
        },
        mandarin: {
          DEFAULT: '#EF4444',
          light: '#FEF2F2',
          border: '#F87171',
        },
        hindi: {
          DEFAULT: '#8B5CF6',
          light: '#F5F3FF',
          border: '#A78BFA',
        },
      },
      animation: {
        'bounce-slow': 'bounce 1.5s infinite',
        'pulse-once': 'pulseOnce 0.4s ease-in-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        pulseOnce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
        },
      },
    },
  },
  plugins: [],
};
