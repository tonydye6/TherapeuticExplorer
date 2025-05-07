import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Sophera custom colors
        sophera: {
          50: "#E6FFFA",  // Very Light Aqua - Gradient start color
          100: "#FFF0E9", // Soft Peach - Gradient end color
          200: "#dce9e7", // Light-medium - Lighter background
          300: "#c2dad6", // Medium
          400: "#a8cbc5", // Medium-dark
          500: "#0D9488", // Primary Teal - Deep Teal - Primary Brand Color
          600: "#0A7D70", // Darker Primary - Hover state
          700: "#086F63", // Even Darker Primary
          800: "#065F54", // Dark for text
          900: "#2D3748", // Dark Charcoal for headings
        },
        coral: {
          50: "#FFF5F2",  // Very light coral
          100: "#FFEAE2",  // Light coral
          200: "#FFD6C7",  // Light-medium coral
          300: "#FFC1AD",  // Medium coral
          400: "#FFAD93",  // Medium-dark coral
          500: "#FF7F50",  // Secondary Accent Color - Bright Coral
          600: "#E67348",  // Darker coral - Hover state
          700: "#CC6640",  // Dark coral
          800: "#B35938",  // Darker coral
          900: "#994D30",  // Darkest coral
        },
        sunny: {
          50: "#FFFDE7",  // Very light yellow
          100: "#FFF9C4",  // Light yellow
          200: "#FFF59D",  // Light-medium yellow
          300: "#FFF176",  // Medium yellow
          400: "#FFEE58",  // Medium-dark yellow
          500: "#FFC107",  // Tertiary Accent Color - Sunny Yellow
          600: "#E6B000",  // Darker yellow - Hover state
          700: "#CC9D00",  // Dark yellow
          800: "#B38900",  // Darker yellow
          900: "#997600",  // Darkest yellow
        },
        charcoal: {
          50: "#F7FAFC",  // Very light charcoal
          100: "#EDF2F7",  // Light charcoal
          200: "#E2E8F0",  // Light-medium charcoal
          300: "#CBD5E0",  // Medium charcoal - Border color
          400: "#A0AEC0",  // Medium-dark charcoal
          500: "#718096",  // Cool Gray - Subtle/Helper text
          600: "#4A5568",  // Medium Gray - Body text
          700: "#2D3748",  // Dark Charcoal - Headings
          800: "#1A202C",  // Darker charcoal
          900: "#171923",  // Darkest charcoal
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
