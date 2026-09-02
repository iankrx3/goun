/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'miyeon-main': '#5A514D',
        'miyeon-sub1': '#D49A9A',
        'miyeon-sub2': '#F7E6E6',
        'miyeon-neutral': '#F3EDE6',
        'miyeon-base': '#FFFFFF',
      },
      fontFamily: {
        display: ['Satoshi', 'Pretendard', 'sans-serif'],
        sans: ['Satoshi', 'Pretendard', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
