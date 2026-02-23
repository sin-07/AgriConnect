/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      animation: {
        'fade-in': 'fade-in 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'slide-down': 'slide-down 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'slide-left': 'slide-left 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'slide-right': 'slide-right 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.22,1,0.36,1) both',
      },
      colors: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        earth: {
          50: "#fdf8f0",
          100: "#f7e8d0",
          200: "#eed5a8",
          300: "#e2b979",
          400: "#d49a4e",
          500: "#c47f2e",
          600: "#a66424",
          700: "#864c1f",
          800: "#6d3d1f",
          900: "#5c341e",
        },
      },
    },
  },
  plugins: [],
};
