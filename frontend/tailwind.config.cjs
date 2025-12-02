/** @type {import('tailwindcss').Config} */
console.log('Tailwind config loaded');
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F2ED', // Warm Apricot Light
        card: '#FFFFFF',       // Pure White
        primary: '#D4A373',    // Gold Apricot
        secondary: '#C49BA3',  // Rose Grey
        text: '#2B1F16',       // Deep Brown
        subtext: '#6B5542',    // Medium Brown
        gold: '#D4A373',       // Unified Gold
        dark: '#2B1F16',       // Mapping dark to deep brown for compatibility
        vintage: {
          bg: '#FDFBF7',
          text: '#5D4037',
          subtext: '#8D6E63',
          accent: '#D7CCC8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        lora: ['"Lora"', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
        songti: ['"Songti SC"', '"Noto Serif SC"', 'serif'],
        kaiti: ['"Kaiti SC"', '"KaiTi"', 'serif'],
        script: ['"Rouge Script"', 'cursive'],
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
