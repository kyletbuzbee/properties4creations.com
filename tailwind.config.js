/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,njk,js}',  // Scan new source folder
    './src/_includes/**/*.{html,njk}' // Scan layouts
  ],

  theme: {
    extend: {
      // Brand Colors from design-tokens.css
      colors: {
        'brand-navy': 'var(--color-primary-navy)',
        'brand-navy-light': 'var(--color-primary-navy-light)',
        'brand-wood': 'var(--color-accent-gold)',
        'brand-gold': 'var(--color-accent-gold)',
        'brand-gold-light': 'var(--color-accent-gold-light)',
        'brand-walnut': 'var(--color-secondary-walnut)',
        'brand-beige': 'var(--color-neutral-beige)',
        primary: {
          navy: 'var(--color-primary-navy)'
        },
        accent: {
          gold: 'var(--color-accent-gold)'
        },
        neutral: {
          white: 'var(--color-neutral-white)',
          beige: 'var(--color-neutral-beige)',
          slate: {
            50: 'var(--color-neutral-slate-50)',
            100: 'var(--color-neutral-slate-100)',
            200: 'var(--color-neutral-slate-200)',
            300: 'var(--color-neutral-slate-300)',
            400: 'var(--color-neutral-slate-400)',
            500: 'var(--color-neutral-slate-500)',
            600: 'var(--color-neutral-slate-600)',
            700: 'var(--color-neutral-slate-700)'
          }
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)'
      },
      // Shadows from design-tokens.css
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        medium: 'var(--shadow-medium)',
        strong: 'var(--shadow-strong)',
        wood: 'var(--shadow-wood)',
        floating: 'var(--shadow-floating)'
      },
      // Spacing scale from design-tokens (extends Tailwind's 4px base)
      spacing: {
        xs: 'var(--space-xs)',  // 0.25rem
        sm: 'var(--space-sm)',  // 0.5rem
        md: 'var(--space-md)',  // 1rem
        lg: 'var(--space-lg)',  // 1.5rem
        xl: 'var(--space-xl)',  // 2rem
        '2xl': 'var(--space-2xl)', // 3rem
        '3xl': 'var(--space-3xl)'  // 4rem
      },
      // Typography from design-tokens
      fontFamily: {
        heading: ['Merriweather', 'serif'],
        body: ['Inter', 'sans-serif']
      },
      // Border radius
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)'
      }
    }
  },
  plugins: []
}
