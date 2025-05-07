import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Ensure border radius aligns with the new design (16px for cards, 10px for buttons/inputs)
      borderRadius: {
        lg: "var(--radius)", // This likely comes from theme.json
        xl: "16px",         // Explicitly for cards as per design spec
        md: "10px",         // Explicitly for buttons/inputs as per design spec
        sm: "8px",          // For smaller elements if needed
      },
      colors: {
        // Core Sophera Palette (aligns with design specifications)
        background: '#F9FAFB', // Off-White - Primary Background (Main Content Area)
                               // The gradient will be applied globally via CSS, not here.
        foreground: '#1F2937', // Dark Charcoal - Default text on light backgrounds

        card: {
          DEFAULT: '#FFFFFF', // White - Card Backgrounds
          foreground: '#2D3748', // Dark Charcoal - Text on cards
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#2D3748',
        },
        primary: { // Primary Brand Color - Deep Teal
          DEFAULT: '#0D9488',
          foreground: '#FFFFFF', // Text on primary background
          hover: '#0A7D70',    // Hover state for primary buttons
          light: 'rgba(13, 148, 136, 0.1)', // For secondary button hover background
          focusRing: 'rgba(13, 148, 136, 0.25)', // For input focus ring
        },
        secondary: { // Secondary Accent Color - Bright Coral
          DEFAULT: '#FF7F50',
          foreground: '#FFFFFF', // Text on secondary background
          hover: '#E67348',    // Hover state for secondary buttons
        },
        tertiary: { // Tertiary Accent Color - Sunny Yellow
          DEFAULT: '#FFC107',
          foreground: '#2D3748', // Text on tertiary background (if used as a bg)
        },
        muted: {
          DEFAULT: '#EFF2F5', // Very Light Cool Gray - Subtle Background Accent
          foreground: '#718096', // Cool Gray - Muted text
        },
        accent: { 
          DEFAULT: '#FF7F50', // Match to secondary for compatibility with shadcn/ui
          foreground: '#FFFFFF',
        },
        destructive: { // Standard destructive color
          DEFAULT: '#EF4444', // Tailwind Red-500
          foreground: '#FFFFFF',
        },
        border: '#CBD5E0', // Light Gray - Border Color (Cards, Inputs)
        input: '#CBD5E0',  // Border color for inputs, can be same as general border
        ring: '#0D9488',   // Primary Brand Color for focus rings

        // Text Colors
        text_headings: '#2D3748', // Dark Charcoal
        text_body: '#4A5568',     // Medium Gray
        text_subtle: '#718096',   // Cool Gray

        // Gradient Colors (for reference, applied via global CSS)
        gradient_start_aqua: '#E6FFFA',
        gradient_end_peach: '#FFF0E9',

        // Specific UI Elements if not covered by semantic names
        sidebar_background: '#FFFFFF',
        sidebar_foreground: '#4A5568',
        sidebar_active_background: 'rgba(13, 148, 136, 0.1)', // primary.light
        sidebar_active_foreground: '#0D9488', // primary.DEFAULT
        sidebar_border: '#EFF2F5',

        // Chart Colors
        chart: {
          "1": '#0D9488', // Primary Brand
          "2": '#FF7F50', // Secondary Accent
          "3": '#FFC107', // Tertiary Accent
          "4": '#3B82F6', // Blue
          "5": '#8B5CF6', // Purple
        },
        
        // Keep our existing color scales for compatibility
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
