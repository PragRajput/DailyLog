import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'rgba(255,255,255,0.07)',
        accent:  { DEFAULT: '#f59e0b', foreground: '#0a0b14' },
        muted:   { DEFAULT: 'rgba(255,255,255,0.04)', foreground: 'rgba(255,255,255,0.4)' },
      },
      borderRadius: { xl: '1rem', '2xl': '1.25rem', '3xl': '1.5rem' },
      boxShadow: {
        glow:        '0 0 20px rgba(245,158,11,0.25)',
        'glow-lg':   '0 0 40px rgba(245,158,11,0.35)',
        'glow-blue': '0 0 20px rgba(96,165,250,0.25)',
        glass:       '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'fade-up':    'fadeUp 0.4s ease',
        'fade-in':    'fadeIn 0.3s ease',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        shimmer:      'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
      },
      backdropBlur: { xs: '4px' },
    },
  },
  plugins: [],
};
export default config;
