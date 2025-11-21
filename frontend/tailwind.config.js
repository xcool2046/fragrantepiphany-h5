/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        background: '#F7F2ED', // Warm Apricot Light
        card: '#FFFFFF',       // Pure White for contrast
        primary: '#D4A373',    // Gold Apricot
        secondary: '#C49BA3',  // Rose Grey
        text: '#2B1F16',       // Deep Brown
        subtext: '#6B5542',    // Medium Brown
        gold: '#D4A373',       // Unified Gold
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #D4A373 0%, #C08B5C 100%)',
        'gradient-dust': 'linear-gradient(to top, #F9F5F1 0%, rgba(249, 245, 241, 0) 100%)',
      },
      boxShadow: {
        card: '0 8px 32px rgba(0, 0, 0, 0.04)',
        glow: '0 0 20px rgba(212, 163, 115, 0.3)',
      },
      borderRadius: {
        card: '24px',
      },
    },
  },
  plugins: [],
}
