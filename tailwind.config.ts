import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Medikal & Fizyoterapi Renk Paleti (implementation_plan.md tabanlı)
        "sage": {
          DEFAULT: "#82A99B", // Deep Sage (Güven veren yeşil)
          light: "#A4C4B8",
          dark: "#5F8074"
        },
        "orchid": {
          DEFAULT: "#C4A5C9", // Soft Orchid (Sakinleştirici mor)
          light: "#E3CDEC",
          dark: "#997C9F"
        },
        "coral": {
          DEFAULT: "#F49D8E", // Warm Coral (Hareket ve enerji)
          light: "#FFBDB3",
          dark: "#D07E6F"
        },
        "aquamarine": {
          DEFAULT: "#76C7C0", // Tazelik
          light: "#9CEBE5",
          dark: "#51A49E"
        },
        "background": "#FDFDFD", // Off-White
        "surface": "rgba(255, 255, 255, 0.7)", // Frosted Glass / Glassmorphism için
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
