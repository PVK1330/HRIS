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
          DEFAULT: '#185FA5',
          light: '#0C447C',
          bg: '#E6F1FB',
        },
        success: {
          DEFAULT: '#3B6D11',
          bg: '#EAF3DE',
          border: '#C0DD97',
        },
        warning: {
          DEFAULT: '#854F0B',
          bg: '#FAEEDA',
          border: '#FAC775',
        },
        danger: {
          DEFAULT: '#A32D2D',
          bg: '#FCEBEB',
          border: '#F7C1C1',
        },
        info: {
          DEFAULT: '#185FA5',
          bg: '#E6F1FB',
        },
        neutral: {
          DEFAULT: '#5F5E5A',
          bg: '#F1EFE8',
        },
        purple: {
          DEFAULT: '#534AB7',
          bg: '#EEEDFE',
        },
        teal: {
          DEFAULT: '#0F6E56',
          bg: '#E1F5EE',
        },
        background: {
          primary: '#FFFFFF',
          secondary: '#F8F9FA',
          tertiary: '#F5F5F5',
        },
        text: {
          primary: '#1F2937',
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
