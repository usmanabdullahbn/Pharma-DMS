import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:      "#070b12",
          card:    "#0c1220",
          card2:   "#111827",
          border:  "#172035",
          border2: "#1f3050",
          text:    "#c8d8e8",
          muted:   "#4e6a8a",
          accent:  "#1f9b55",
          blue:    "#3d8ef7",
          amber:   "#c9991a",
          red:     "#d94040",
          purple:  "#9c6ff0",
          teal:    "#1ab3c0",
        },
      },
      fontFamily: {
        sans: ["Trebuchet MS", "Tahoma", "Geneva", "sans-serif"],
        mono: ["Courier New", "Lucida Console", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
