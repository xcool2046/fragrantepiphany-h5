/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F0E5',
        card: '#F3E6D7',
        primary: '#D4A373',
        secondary: '#C49BA3',
        text: '#2B1F16',
        subtext: '#6B5542',
      },
      boxShadow: {
        card: '0 12px 30px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        card: '20px',
      },
    },
  },
  plugins: [],
}
