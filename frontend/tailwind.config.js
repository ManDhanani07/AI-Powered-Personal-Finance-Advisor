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
        // MNC Dark Enterprise Palette — Emerald / Teal Primary
        primary: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981', // MNC Emerald Primary
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          DEFAULT: '#10B981',
        },
        accent: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6', // Accent Teal
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          DEFAULT: '#14B8A6',
        },
        success: {
          DEFAULT: '#10B981',
          500: '#10B981',
        },
        warning: {
          DEFAULT: '#F59E0B',
          500: '#F59E0B',
        },
        danger: {
          DEFAULT: '#F43F5E',
          500: '#F43F5E',
        },
        dark: {
          DEFAULT: '#000000',
          900: '#09090B',
          950: '#000000',
        },
        light: {
          DEFAULT: '#F8FAFC',
          50: '#F8FAFC',
        },
        // MNC Theme variables for dark glass surface design
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
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'soft-lg': '0 10px 30px -4px rgba(0, 0, 0, 0.8)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
        'glow-primary': '0 0 40px -5px rgba(16, 185, 129, 0.3)',
        'glow-accent': '0 0 40px -5px rgba(20, 184, 166, 0.3)',
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
