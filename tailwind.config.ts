import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  // Dark mode via class (supports AMOLED theme)
  darkMode: 'class',

  theme: {
    extend: {
      // ─── Color System ────────────────────────────────────────────────────────
      // All colors use CSS variables so themes can override them at runtime.
      // Raw values are defined in globals.css as :root variables.
      colors: {
        // Base palette — warm, elegant, timeless
        ink: {
          DEFAULT: 'var(--color-ink)',
          muted: 'var(--color-ink-muted)',
        },
        parchment: {
          DEFAULT: 'var(--color-parchment)',
          deep: 'var(--color-parchment-deep)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
          overlay: 'var(--color-surface-overlay)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        muted: 'var(--color-muted)',

        // Brand accent — dusty rose
        rose: {
          DEFAULT: 'var(--color-rose)',
          light: 'var(--color-rose-light)',
          dark: 'var(--color-rose-dark)',
        },

        // Secondary warmth — antique gold
        gold: {
          DEFAULT: 'var(--color-gold)',
          light: 'var(--color-gold-light)',
        },

        // Semantic states
        success: {
          DEFAULT: 'var(--color-success)',
          light: 'var(--color-success-light)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          light: 'var(--color-warning-light)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          light: 'var(--color-error-light)',
        },
      },

      // ─── Typography ──────────────────────────────────────────────────────────
      fontFamily: {
        // Display: Cormorant Garamond — elegant, literary, romantic
        display: ['var(--font-display)', 'Georgia', 'serif'],
        // Body / UI: DM Sans — friendly, clean, modern
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        // Monospace: for any code/key display
        mono: ['var(--font-mono)', 'monospace'],
      },

      fontSize: {
        // Type scale — generous and clear
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        xs: ['0.75rem', { lineHeight: '1.125rem' }],
        sm: ['0.875rem', { lineHeight: '1.375rem' }],
        base: ['1rem', { lineHeight: '1.625rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.375rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.75rem' }],
        '5xl': ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.02em' }],
        '6xl': ['3.75rem', { lineHeight: '4.25rem', letterSpacing: '-0.025em' }],
        '7xl': ['4.5rem', { lineHeight: '5rem', letterSpacing: '-0.03em' }],
        '8xl': ['6rem', { lineHeight: '6.5rem', letterSpacing: '-0.04em' }],
      },

      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },

      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        normal: '0',
        wide: '0.04em',
        wider: '0.08em',
        widest: '0.16em',
      },

      // ─── Spacing ─────────────────────────────────────────────────────────────
      // Using the default Tailwind scale but noting our generous spacing philosophy.
      // We extend with a few specific values.
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '17': '4.25rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '128': '32rem',
        '144': '36rem',
      },

      // ─── Border Radius ───────────────────────────────────────────────────────
      borderRadius: {
        none: '0',
        xs: '0.25rem',
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.625rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        full: '9999px',
      },

      // ─── Shadows ─────────────────────────────────────────────────────────────
      // Warm shadows — a hint of rose/gold, never cold gray
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(28, 25, 23, 0.04)',
        'sm': '0 1px 3px 0 rgba(28, 25, 23, 0.06), 0 1px 2px -1px rgba(28, 25, 23, 0.04)',
        'DEFAULT': '0 4px 6px -1px rgba(28, 25, 23, 0.07), 0 2px 4px -2px rgba(28, 25, 23, 0.05)',
        'md': '0 4px 6px -1px rgba(28, 25, 23, 0.07), 0 2px 4px -2px rgba(28, 25, 23, 0.05)',
        'lg': '0 10px 15px -3px rgba(28, 25, 23, 0.08), 0 4px 6px -4px rgba(28, 25, 23, 0.04)',
        'xl': '0 20px 25px -5px rgba(28, 25, 23, 0.09), 0 8px 10px -6px rgba(28, 25, 23, 0.04)',
        '2xl': '0 25px 50px -12px rgba(28, 25, 23, 0.15)',
        'card': '0 2px 8px rgba(28, 25, 23, 0.06), 0 0 1px rgba(28, 25, 23, 0.08)',
        'card-hover': '0 8px 24px rgba(28, 25, 23, 0.10), 0 0 1px rgba(28, 25, 23, 0.08)',
        'rose': '0 4px 14px rgba(196, 113, 122, 0.25)',
        'gold': '0 4px 14px rgba(184, 147, 90, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(28, 25, 23, 0.05)',
        'none': 'none',
      },

      // ─── Animation ───────────────────────────────────────────────────────────
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },

      transitionTimingFunction: {
        'ease-in-out-soft': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out-soft': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-soft': 'cubic-bezier(0.4, 0, 1, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'elegant': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },

      keyframes: {
        // Gentle fade in
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        // Fade in with upward float
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // Fade in with downward float
        'fade-down': {
          from: { opacity: '0', transform: 'translateY(-16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // Scale in from center
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        // Shimmer for skeleton loaders
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Gentle pulse for ambient elements
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        // Floating animation for decorative elements
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        // Wax seal glow
        'glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(196, 113, 122, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(196, 113, 122, 0.6)' },
        },
        // Petal fall for Sakura theme
        'fall': {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0' },
        },
      },

      animation: {
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'fade-down': 'fade-down 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'fall': 'fall 6s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },

      // ─── Screens ─────────────────────────────────────────────────────────────
      // Mobile-first breakpoints
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },

      // ─── Z-Index Scale ───────────────────────────────────────────────────────
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'dropdown': '100',
        'sticky': '200',
        'fixed': '300',
        'modal-backdrop': '400',
        'modal': '500',
        'popover': '600',
        'toast': '700',
        'tooltip': '800',
      },

      // ─── Background Images ───────────────────────────────────────────────────
      backgroundImage: {
        'gradient-rose': 'linear-gradient(135deg, var(--color-rose-light) 0%, var(--color-parchment) 100%)',
        'gradient-gold': 'linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-parchment) 100%)',
        'gradient-subtle': 'linear-gradient(180deg, var(--color-parchment) 0%, var(--color-surface) 100%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },

  plugins: [],
}

export default config
