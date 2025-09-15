import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'azure-radiance': {
          '50': '#eefaff',
          '100': '#daf2ff',
          '200': '#bde9ff',
          '300': '#90dcff',
          '400': '#5bc6ff',
          '500': '#35aafc',
          '600': '#1f8cf1',
          '700': '#1879e7',
          '800': '#195eb4',
          '900': '#1b508d',
          '950': '#153156',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      fontFamily: {
        'martelsans-extraLight': ['var(--font-martelsans-extralight)', 'sans-serif'],
        'martelsans-light': ['var(--font-martelsans-light)', 'sans-serif'],
        'martelsans-regular': ['var(--font-martelsans-regular)', 'sans-serif'],
        'martelsans-semiBold': ['var(--font-martelsans-semibold)', 'sans-serif'],
        'martelsans-bold': ['var(--font-martelsans-bold)', 'sans-serif'],
        'martelsans-extraBold': ['var(--font-martelsans-extrabold)', 'sans-serif'],
        'martelsans-black': ['var(--font-martelsans-black)', 'sans-serif'],
        'neue-ultraBold': ['var(--font-neue-ultrabold)', 'sans-serif'],
        'neue-bold': ['var(--font-neue-bold)', 'sans-serif'],
        'neue-medium': ['var(--font-neue-medium)', 'sans-serif'],
        'neue-regular': ['var(--font-neue-regular)', 'sans-serif']
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
