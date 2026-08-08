/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        // Design System Custom Palette (As specified)
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB', // Specified Primary Blue
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#172554',
          DEFAULT: '#2563EB',
        },
        accent: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6', // Specified Accent Teal
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          DEFAULT: '#14B8A6',
        },
        success: {
          DEFAULT: '#22C55E', // Specified Green
          500: '#22C55E',
        },
        warning: {
          DEFAULT: '#F59E0B', // Specified Amber
          500: '#F59E0B',
        },
        danger: {
          DEFAULT: '#EF4444', // Specified Red
          500: '#EF4444',
        },
        dark: {
          DEFAULT: '#0F172A', // Specified Dark Navy/Slate
          900: '#0F172A',
          950: '#080B11',
        },
        light: {
          DEFAULT: '#F8FAFC', // Specified Light Slate
          50: '#F8FAFC',
        },
        // Theme variables for dark glass design
        base: 'var(--color-bg-base)',
        surface: 'var(--color-bg-surface)',
        elevated: 'var(--color-bg-elevated)',
        'bg-base': 'var(--color-bg-base)',
        'bg-surface': 'var(--color-bg-surface)',
        'bg-elevated': 'var(--color-bg-elevated)',
        'border-subtle': 'var(--color-border-subtle)',
        'border-strong': 'var(--color-border-strong)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        'soft-lg': '0 10px 30px -4px rgba(15, 23, 42, 0.08)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
        'glow-primary': '0 0 40px -5px rgba(37, 99, 235, 0.4)',
        'glow-accent': '0 0 40px -5px rgba(20, 184, 166, 0.4)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'blob-spin': 'blobSpin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        blobSpin: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
