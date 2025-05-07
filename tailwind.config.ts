import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Ensure 'Inter' is the default sans-serif font
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: "16px", // Card radius
        xl: "16px", // Explicitly for cards as per design spec
        md: "12px", // Medium radius for buttons
        sm: "8px",  // For smaller elements if needed
        
        // Sophera Specific Radii
        'sophera-card': '16px',      // For cards
        'sophera-button': '12px',    // For buttons
        'sophera-input': '12px',     // For input fields
        'sophera-modal-outer': '24px', // For outer modal container
        'sophera-modal-inner': '20px', // For inner modal content
        'sophera-tab-active': '10px',  // For active tabs
      },
      colors: {
        // Core Sophera Palette (aligns with design specifications)
        background: '#F9FAFB', // Off-White - Primary Background (Main Content Area)
                               // The gradient will be applied globally via CSS, not here.
        foreground: '#2D3748', // Dark Charcoal - Default text on light backgrounds

        card: {
          DEFAULT: '#FFFFFF', // White - Card Backgrounds (sophera-bg-card)
          foreground: '#2D3748', // Dark Charcoal - Text on cards (sophera-text-heading)
        },
        popover: {
          DEFAULT: '#FFFFFF', // White
          foreground: '#2D3748', // Dark Charcoal
        },
        primary: { // Primary Brand Color - Deep Teal
          DEFAULT: '#0D9488', // sophera-brand-primary
          foreground: '#FFFFFF', // Text on primary background
          hover: '#0A7D70',    // Hover state for primary buttons (sophera-brand-primary-hover)
          light: 'rgba(13, 148, 136, 0.1)', // For secondary button hover background (sophera-brand-primary-light)
          focusRing: 'rgba(13, 148, 136, 0.25)', // For input focus ring (sophera-brand-primary-focusRing)
        },
        secondary: { // Secondary Accent Color - Bright Coral
          DEFAULT: '#FF7F50', // sophera-accent-secondary
          foreground: '#FFFFFF', // Text on secondary background
          hover: '#E67348',    // Hover state for secondary buttons (sophera-accent-secondary-hover)
        },
        tertiary: { // Tertiary Accent Color - Sunny Yellow
          DEFAULT: '#FFC107', // sophera-accent-tertiary
          foreground: '#2D3748', // Text on tertiary background (sophera-text-heading)
        },
        muted: {
          DEFAULT: '#F3F4F6', // Very Light Cool Gray - Subtle Background Accent (charcoal.100)
          foreground: '#718096', // Cool Gray - Muted text (sophera-text-subtle)
        },
        accent: { 
          DEFAULT: '#FFC107', // Sunny Yellow - alternative accent for compatibility with shadcn/ui
          foreground: '#2D3748', // Dark Charcoal
        },
        destructive: { // Standard destructive color
          DEFAULT: '#EF4444', // Tailwind Red-500 (sophera-destructive)
          foreground: '#FFFFFF',
        },
        border: '#CBD5E0', // Light Gray - Border Color (sophera-border-primary)
        input: '#CBD5E0',  // Border color for inputs
        ring: '#0D9488',   // Primary Brand Color for focus rings

        // Text Colors
        text_headings: '#2D3748', // Dark Charcoal (sophera-text-heading)
        text_body: '#4A5568',     // Medium Gray (sophera-text-body)
        text_subtle: '#718096',   // Cool Gray (sophera-text-subtle)

        // Gradient Colors (for reference, applied via global CSS)
        gradient_start: '#E6FFFA', // Very Light Teal/Mint (sophera-gradient-start)
        gradient_end: '#FFF3E0',   // Pale Orange/Peach (sophera-gradient-end)

        // Specific UI Elements if not covered by semantic names
        sidebar_background: '#FFFFFF',
        sidebar_foreground: '#4A5568',
        sidebar_active_background: 'rgba(13, 148, 136, 0.1)', // sophera-brand-primary-light
        sidebar_active_foreground: '#0D9488', // sophera-brand-primary
        sidebar_border: '#E5E7EB', // Light Gray (charcoal.200)

        // Chart Colors
        chart: {
          "1": '#0D9488', // Primary - Deep Teal
          "2": '#FF7F50', // Secondary - Bright Coral
          "3": '#FFC107', // Tertiary - Sunny Yellow
          "4": '#60A5FA', // Vibrant Blue
          "5": '#A78BFA', // Vibrant Purple
        },
        
        // Detailed color scales directly from the design specifications
        sophera: {
          50: "#E6FFFA",  // Very Light Teal/Mint (sophera-gradient-start) - Body Bg Start
          100: "#B2F5EA", // Lighter Teal
          200: "#84E9DD", // Light Teal
          300: "#56DCCF", // Medium Teal
          400: "#28CFBF", // Bright Teal
          500: "#0D9488", // Primary Teal - Deep Teal (sophera-brand-primary)
          600: "#0A7D70", // Darker Primary - Hover state (sophera-brand-primary-hover)
          700: "#086F63", // Even Darker Primary
          800: "#065F54", // Dark for text accents
          900: "#044F45", // Darkest Teal
        },
        coral: {
          50: "#FFF3E0",  // Pale Orange/Peach (sophera-gradient-end) - Body Bg End
          100: "#FFE0B2", // Light Peach
          200: "#FFCC80", // Peach 
          300: "#FFB74D", // Darker Peach
          400: "#FFA726", // Orange
          500: "#FF7F50", // Secondary Accent Color - Bright Coral (sophera-accent-secondary)
          600: "#E67348", // Darker Coral - Hover state (sophera-accent-secondary-hover)
          700: "#CC6640", // Dark Coral
          800: "#B35938", // Even Darker Coral
          900: "#994D30", // Darkest Coral
        },
        sunny: {
          50: "#FFFDE7",  // Very light yellow
          100: "#FFF9C4", // Light yellow 
          200: "#FFF59D", // Light-medium yellow
          300: "#FFF176", // Medium yellow
          400: "#FFEE58", // Medium-dark yellow
          500: "#FFC107", // Tertiary Accent Color - Sunny Yellow (sophera-accent-tertiary)
          600: "#FFB300", // Darker yellow - Hover state
          700: "#FFA000", // Dark yellow
          800: "#FF8F00", // Darker yellow
          900: "#FF6F00", // Darkest yellow
        },
        charcoal: {
          50: "#F9FAFB",  // Off-White (Alternative for card/popover bg if pure white is too stark on gradient)
          100: "#F3F4F6", // Very Light Gray
          200: "#E5E7EB", // Light Gray (Sidebar border)
          300: "#D1D5DB", // Light Medium Gray
          400: "#9CA3AF", // Medium Gray
          500: "#718096", // Cool Gray (sophera-text-subtle) - Muted foreground
          600: "#4A5568", // Medium Gray (sophera-text-body) - Body text
          700: "#374151", // Dark Gray
          800: "#1F2937", // Darker Gray
          900: "#2D3748", // Dark Charcoal (sophera-text-heading) - Headings
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
