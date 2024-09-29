import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundImage: {
        "vertical-stripes":
          "linear-gradient(to right, #E6F3FF 25%, transparent 100%), linear-gradient(to right, #93C5FD 54%, transparent 10%)",
      },
    },
  },
  plugins: [],
};
export default config;
