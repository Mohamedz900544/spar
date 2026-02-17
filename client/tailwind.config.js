/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F8BFFF",
        accent: "#F4F4FF",
        highlight: "#FFD464",
        brand: "#006CFF", // Optional blue
      },
    },
  },
  plugins: [],
}
