const appEnv = process.env.APP_ENV || 'apollo';
require('dotenv').config({ path: `.env.${appEnv}` });

const primary = process.env.PRIMARY_COLOR || "#7353ea";
const secondary = process.env.SECONDARY_COLOR || "#4f34c4";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.js", "./src/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: `${primary}1a`, // very light
          100: `${primary}33`, // light
          200: `${primary}4d`,
          500: primary,
          600: secondary,
          700: secondary,
          900: `${primary}0d`, // faint bg
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

