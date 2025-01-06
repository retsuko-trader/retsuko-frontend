import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['NanumSquareNeo', 'sans-serif'],
        mono: ['Iosevka SS04 Web', 'monospace'],
      },
      colors: {
        h: {
          'red': 'rgb(var(--color-red) / <alpha-value>)',
          'green': 'rgb(var(--color-green) / <alpha-value>)',
          'yellow': 'rgb(var(--color-yellow) / <alpha-value>)',
          'blue': 'rgb(var(--color-blue) / <alpha-value>)',
          'purple': 'rgb(var(--color-purple) / <alpha-value>)',
          'cyan': 'rgb(var(--color-cyan) / <alpha-value>)',
          'white': 'rgb(var(--color-white) / <alpha-value>)',
          'black': 'rgb(var(--color-black) / <alpha-value>)',

          'primary': 'rgb(var(--color-primary) / <alpha-value>)',
          'secondary': 'rgb(var(--color-secondary) / <alpha-value>)',
          'background': 'rgb(var(--color-background) / <alpha-value>)',
          'tone': 'rgb(var(--color-text) / <alpha-value>)',
          'text': 'rgb(var(--color-text) / <alpha-value>)',
        }
      },
    },
  },
  plugins: [],
  safelist: [
    'h-5',
  ],
} satisfies Config;
