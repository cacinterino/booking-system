import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        ink: '#14213D',
        'ink-soft': '#233258',
        paper: '#F5F0E4',
        'paper-white': '#FFFDF8',
        brass: '#B8862B',
        'brass-soft': '#D8AE5F',
        sage: '#4F7860',
        slate: '#5B6270',
        line: 'rgba(20,33,61,0.14)',
      },
      backgroundColor: {
        DEFAULT: 'var(--paper)',
      },
      textColor: {
        DEFAULT: 'var(--ink)',
      },
    },
  },
  plugins: [],
} satisfies Config