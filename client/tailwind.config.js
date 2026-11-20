import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
        },
        secondary: "var(--color-secondary)",
        tertiary: "var(--color-tertiary)",
        main: "var(--text-main)",
        muted: "var(--text-muted)",
        inverse: "var(--text-inverse)",
        surface: "var(--bg-surface)",
        body: "var(--bg-main)",
      },
      borderRadius: {
        'premium-card': "var(--radius-card)",
        'premium-input': "var(--radius-input)",
        'premium-btn': "var(--radius-btn)",
      },
      boxShadow: {
        'premium': "var(--shadow-premium)",
        'premium-hover': "var(--shadow-active)",
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      spacing: {
        'page-x': "var(--page-px)",
        'page-y': "var(--page-pt)",
      },
      keyframes: {
        progress: {
          '0%': { transform: 'scaleX(1)' },
          '100%': { transform: 'scaleX(0)' },
        },
      },
      animation: {
        progress: 'progress 4s linear forwards',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
