/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}",],
  darkMode: 'class',
  theme: {
    extend: {
      //Colors used in this project
      colors: {
        primary: "#2B85FF",
        secondary: "#EF863E",
        lightBorderStart: '#3b82f6',
        lightBorderMid: '#2563eb',
        darkBorderStart: '#fbbf24',
        darkBorderMid: '#f59e0b',
      },
      keyframes: {
        'hover-scale': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        snapEffect: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.7) rotate(20deg)' },
        },
        rollBack: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '50%': { transform: 'translateX(-50%)', opacity: '0.5' },
          '100%': { transform: 'translateX(-100%)', opacity: '0' },
        },
        pulseLight: {
          '0%, 100%': { borderColor: '#3b82f6' },
          '50%': { borderColor: '#2563eb' },
        },
        pulseDark: {
          '0%, 100%': { borderColor: '#fbbf24' },
          '50%': { borderColor: '#f59e0b' },
        },
      },
      animation: {
        'hover-scale': 'hover-scale 2s infinite ease-in-out',
        snap: 'snapEffect 1.5s ease-in-out forwards',
        rollBack: 'rollBack 1s forwards',
        pulseLight: 'pulseLight 1.5s infinite ease-in-out',
        pulseDark: 'pulseDark 1.5s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}

