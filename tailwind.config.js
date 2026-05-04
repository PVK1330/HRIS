/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#0F766E',
          light: '#14B8A6',
          dark: '#0D5F57',
          bg: '#F0FDFA',
        },
        success: {
          DEFAULT: '#059669',
          bg: '#ECFDF5',
          border: '#6EE7B7',
        },
        warning: {
          DEFAULT: '#B45309',
          bg: '#FFFBEB',
          border: '#FCD34D',
        },
        danger: {
          DEFAULT: '#991B1B',
          bg: '#FEF2F2',
          border: '#FCA5A5',
        },
        info: {
          DEFAULT: '#0369A1',
          bg: '#F0F9FF',
        },
        neutral: {
          DEFAULT: '#4B5563',
          bg: '#F3F4F6',
        },
        purple: {
          DEFAULT: '#6D28D9',
          bg: '#F5F3FF',
        },
        burgundy: {
          DEFAULT: '#7C2D12',
          bg: '#FFF7ED',
        },
        background: {
          primary: '#FFFFFF',
          secondary: '#F9FAFB',
          tertiary: '#F3F4F6',
        },
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
        },
        border: {
          primary: '#E5E7EB',
          secondary: '#D1D5DB',
          tertiary: '#E5E7EB',
        },
      },
    },
  },
  plugins: [],
}
