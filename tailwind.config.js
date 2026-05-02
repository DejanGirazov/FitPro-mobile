/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#00BFFF", // the cyan/blue used in FITPRO logo text and timer
        secondary: "#1A2744", // the dark navy blue of the cards/rows
        danger: "#E63946", // the red delete buttons
        success: "#22C55E", // the green FINISH WORKOUT button
        background: "#0A0F1E", // the very dark navy background
        card: "#1C2A4A", // the slightly lighter card background
        text: "#FFFFFF", // white text
        muted: "#8E8E93", // grey muted text
      },
    },
  },
  plugins: [],
};
