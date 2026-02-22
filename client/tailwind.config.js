/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  "#e8edf5",
          100: "#c5cfea",
          200: "#9badd5",
          300: "#708bc0",
          400: "#4a6aa8",
          500: "#1a3a6b",
          600: "#102a5a",
          700: "#0d2248",
          800: "#0a1a38",
          900: "#071228",
          950: "#040b18",
        },
        gold: {
          DEFAULT: "#FBBF24",
          50:  "#FFF9E6",
          100: "#FEF3CD",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
        teal: {
          DEFAULT: "#2dd4bf",
          50:  "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
        },
        primary: "#FBBF24",
        accent: "#2dd4bf",
        highlight: "#FBBF24",
        brand: "#102a5a",
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        display: ["'Poppins'", "'Inter'", "sans-serif"],
      },
      keyframes: {
        sparkle: {
          "0%, 100%": { opacity: "0", transform: "scale(0)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
        "float-up": {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
          "100%": { transform: "translateY(0px)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        sparkle: "sparkle 3s ease-in-out infinite",
        "float-up": "float-up 4s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
}
