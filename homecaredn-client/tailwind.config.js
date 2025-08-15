/** @type {import('tailwindcss').Config} */
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0d6efd', // Màu Bootstrap Primary
      },
    },
  },
  plugins: [],
};
