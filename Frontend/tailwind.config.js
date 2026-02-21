/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'admin': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        // Sistema tipográfico admin
        'admin-xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        'admin-sm': ['0.8125rem', { lineHeight: '1.25rem', letterSpacing: '0' }],
        'admin-base': ['0.875rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'admin-lg': ['1rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'admin-xl': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.02em' }],
        'admin-2xl': ['1.25rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        'admin-3xl': ['1.5rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        'admin-4xl': ['1.875rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],
        'admin-5xl': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.03em' }],
      },
      fontWeight: {
        'admin-light': '300',
        'admin-normal': '400',
        'admin-medium': '500',
        'admin-semibold': '600',
        'admin-bold': '700',
      },
      colors: {
        'adi-pink': '#FFC0CB',
        'adi-pink-dark': '#FFB6C1',
        'adi-red': '#FF69B4',
        'adi-red-dark': '#FF1493',
        'dark-bg': '#0f172a',
        'dark-surface': '#1e293b',
        'dark-surface-light': '#334155',
        'dark-border': '#475569',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    function({ addComponents }) {
      addComponents({
        // Jerarquía tipográfica admin
        '.admin-hero': {
          '@apply text-admin-4xl md:text-admin-5xl font-admin-bold tracking-tight text-slate-900 dark:text-white': {},
        },
        '.admin-h1': {
          '@apply text-admin-3xl md:text-admin-4xl font-admin-semibold tracking-tight text-slate-900 dark:text-white': {},
        },
        '.admin-h2': {
          '@apply text-admin-2xl font-admin-semibold tracking-tight text-slate-800 dark:text-slate-100': {},
        },
        '.admin-h3': {
          '@apply text-admin-xl font-admin-medium tracking-tight text-slate-800 dark:text-slate-100': {},
        },
        '.admin-h4': {
          '@apply text-admin-lg font-admin-medium text-slate-700 dark:text-slate-200': {},
        },
        '.admin-body': {
          '@apply text-admin-base font-admin-normal text-slate-600 dark:text-slate-300 leading-relaxed': {},
        },
        '.admin-body-sm': {
          '@apply text-admin-sm font-admin-normal text-slate-500 dark:text-slate-400': {},
        },
        '.admin-caption': {
          '@apply text-admin-xs font-admin-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider': {},
        },
        '.admin-label': {
          '@apply text-admin-sm font-admin-medium text-slate-600 dark:text-slate-300': {},
        },
        '.admin-button': {
          '@apply text-admin-sm font-admin-semibold tracking-tight': {},
        },
        '.admin-data': {
          '@apply text-admin-base font-admin-medium text-slate-700 dark:text-slate-200 tabular-nums': {},
        },
      });
    },
  ],
}
