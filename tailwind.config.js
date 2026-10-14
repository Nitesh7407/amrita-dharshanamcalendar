/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sacred: {
          ivory: '#FDFCF7',
          cream: '#FBF7EE',
          sand: '#F4ECE1',
          gold: '#D4AF37',
          goldDark: '#B38F26',
          goldLight: '#E8D279',
          maroon: '#6E1B24',
          maroonDark: '#4A0E15',
          maroonLight: '#8C2B36',
          saffron: '#E65C00',
          saffronLight: '#FF8833',
          saffronDark: '#B84500',
          green: '#2A5C38',
          greenDark: '#1B3D25',
          sage: '#E5ECE6',
          border: '#E8DEC8',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        sanskrit: ['DevanagariMT', 'Devanagari Sangam MN', 'Noto Sans Devanagari', 'Mangal', 'serif'],
        tamil: ['Tamil Sangam MN', 'Tamil MN', 'Noto Sans Tamil', 'Latha', 'serif'],
        telugu: ['Telugu Sangam MN', 'Telugu MN', 'Noto Sans Telugu', 'Gautami', 'serif'],
      },
      boxShadow: {
        'sacred': '0 4px 20px -2px rgba(110, 27, 36, 0.08), 0 2px 6px -1px rgba(212, 175, 55, 0.12)',
        'card': '0 2px 12px rgba(90, 40, 20, 0.06)',
      }
    },
  },
  plugins: [],
}
