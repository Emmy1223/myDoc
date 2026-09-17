/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "'Geist Variable'",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        display: [
          "'Plus Jakarta Sans Variable'",
          "'Geist Variable'",
          "Inter",
          "ui-sans-serif",
          "sans-serif",
        ],
      },
      colors: {
        paper: "#FAFAF9",
        ink: "#1C1917",
        rust: {
          DEFAULT: "#C2410C",
          dark: "#9A3412",
        },
      },
      letterSpacing: {
        tightish: "-0.02em",
      },
    },
  },
  plugins: [],
};
