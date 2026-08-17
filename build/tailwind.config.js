/* RM SERVICES — Tailwind production build config (used by build/build-css.sh) */
module.exports = {
  content: ['*.html', 'assets/js/app.js'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--base) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        primary: {
          50: 'rgb(var(--p-50) / <alpha-value>)',
          100: 'rgb(var(--p-100) / <alpha-value>)',
          200: 'rgb(var(--p-200) / <alpha-value>)',
          300: 'rgb(var(--p-300) / <alpha-value>)',
          400: 'rgb(var(--p-400) / <alpha-value>)',
          500: 'rgb(var(--p-500) / <alpha-value>)',
          600: 'rgb(var(--p-600) / <alpha-value>)',
          700: 'rgb(var(--p-700) / <alpha-value>)'
        }
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(15 23 42 / 0.05), 0 10px 30px -14px rgb(15 23 42 / 0.14)',
        pop: '0 16px 48px -16px rgb(15 23 42 / 0.3)'
      },
      borderRadius: { '2xl': '1rem' }
    }
  }
};
