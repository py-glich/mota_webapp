/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        moto: {
          bg: '#0A0D14',        // Deepest charcoal black background
          sidebar: '#0C0F17',   // Sidebar canvas
          card: '#111622',      // Primary card surface
          cardHover: '#161C2A', // Hover card surface
          border: '#1B2232',    // Card subtle border
          borderHover: '#263046',
          muted: '#8A94A6',     // Subdued text
        },
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48', // Vibrant crimson red matching screenshot
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        slate: {
          850: '#111622',
          950: '#0A0D14',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        urdu: ['"Noto Nastaliq Urdu"', '"Jameel Noori Nastaleeq"', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
