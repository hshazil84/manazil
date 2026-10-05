import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FCFBF7',
        wash: '#F0F5EF',
        ink: '#16241F',
        gold: { DEFAULT: '#B8791F', soft: '#D4A030', light: '#E8B84A' },
        mint: { DEFAULT: '#2F5C4C', bg: '#E7F1EC' },
        deep: '#12302A',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        arabic: ['var(--font-arabic)', 'serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(22,36,31,0.04), 0 18px 40px -18px rgba(22,36,31,0.18)',
        float: '0 24px 60px -20px rgba(22,36,31,0.35)',
      },
    },
  },
  plugins: [],
};
export default config;
