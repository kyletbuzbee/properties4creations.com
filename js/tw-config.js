tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          navy: 'var(--color-primary-navy)',
          wood: 'var(--color-accent-gold)',
          walnut: 'var(--color-secondary-walnut)',
          beige: 'var(--color-neutral-beige)',
          surface: 'var(--color-neutral-white)',
          slate: 'var(--color-neutral-slate-500)'
        }
      },
      fontFamily: {
        heading: ['Merriweather','serif'],
        body: ['Inter','sans-serif']
      },
      boxShadow: {
        wood: 'var(--shadow-wood)',
        navy: 'var(--shadow-medium)'
      }
    }
  }
};
