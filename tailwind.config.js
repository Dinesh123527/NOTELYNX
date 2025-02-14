/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      //Colors used in this project
      colors: {
        primary: "#2B85FF",
        secondary: "#EF863E",
      },
      keyframes: {
        'bounce-in': {
          '0%': { opacity: 0, transform: 'translateY(50px) scale(0.9)' },
          '60%': { opacity: 1, transform: 'translateY(-20px) scale(1.05)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'bounce-in': 'bounce-in 0.7s ease-out',
      },
    },
  },
  plugins: [],
}

