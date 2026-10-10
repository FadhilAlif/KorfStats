import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

/**
 * Design tokens — KorfStats Corporate Minimalist
 * - brand  : navy corporate (primer, Home / Tim A)
 * - teal   : bawaan Tailwind (Away / Tim B)
 * - amber  : bawaan Tailwind (Tim C)
 * - score  : kuning borang resmi #FFFF00 (khusus kotak skor running score)
 */
const config: Config = {
  // Scan seluruh src karena kelas tema juga didefinisikan di file .ts (mis. lib/ui/team-theme.ts)
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF4FB',
          100: '#DCE6F5',
          200: '#B9CDEB',
          300: '#8AAADB',
          400: '#5A84C7',
          500: '#3A66B0',
          600: '#2A5298',
          700: '#1F3F7A',
          800: '#172F5C',
          900: '#0F1F3D',
          950: '#0A1529',
        },
        canvas: '#F5F7FA',
        score: '#FFFF00',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-mono)', ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 31 61 / 0.04), 0 0 0 1px rgb(15 31 61 / 0.07)',
        raised: '0 8px 24px -8px rgb(15 31 61 / 0.18), 0 0 0 1px rgb(15 31 61 / 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
