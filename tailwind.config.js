/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'goun-rose': '#B98278',
        'han-cream': '#E8D8D1',
        'warm-taupe': '#76645D',
        'goun-white': '#FFFFFF',
      },
      fontFamily: {
        display: ['"Bodoni Moda"', 'Bodoni', 'serif'],
        sans: ['Satoshi', 'Pretendard', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
