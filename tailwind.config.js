/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gitlab: {
          dark: {
            bg: '#1F2937',
            surface: '#374151',
            border: '#4B5563',
            text: '#F3F4F6',
            'text-muted': '#9CA3AF',
          },
          accent: {
            blue: '#3B82F6',
            purple: '#8B5CF6',
            green: '#10B981',
            red: '#EF4444',
            yellow: '#F59E0B',
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
