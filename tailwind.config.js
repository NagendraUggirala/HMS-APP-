/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.js", "./src/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fffaf3",
          100: "#fdf3e3",
          200: "#f8e7d6",
          500: "#7353ea",
          600: "#5f3fe0",
          700: "#4f34c4",
          900: "#fff8ef",
        },
        surface: {
          50: "#fffdf8",
          100: "#fff9f1",
          200: "#f7f0e6",
          300: "#ece3d8",
        },
        ink: {
          500: "#7c728f",
          700: "#4b4457",
          900: "#251f33",
        },
      },
    },
  },
  plugins: [],
};

