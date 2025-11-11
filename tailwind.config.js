/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Manual dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // COLORS
      colors: {
        primary: '#1e40af',       // Deep professional blue
        secondary: '#8b5cf6',     // Lively purple accent
        background: '#f8fafc',    // Light gray background
        darkBg: '#0f172a',        // Dark mode background
        lightText: '#111827',     // Text for light backgrounds
        darkText: '#f9fafb',      // Text for dark backgrounds
        success: '#22c55e',       // Success messages/buttons
        danger: '#ef4444',        // Errors / warnings
        neutral: '#6b7280',       // Borders, dividers, secondary text
      },

      // TYPOGRAPHY
      fontFamily: {
        sans: ['Inter', 'sans-serif'],      // General text
        heading: ['Poppins', 'sans-serif'], // Titles, headers
      },

      // ANIMATIONS
      animation: {
        fadeIn: 'fadeIn 0.8s ease-in-out',
        rollDown: 'rollDown 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        rollDown: {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },

      // BORDER RADIUS
      borderRadius: {
        DEFAULT: '0.5rem', // Smooth rounded corners
        lg: '0.75rem',
      },

      // SHADOWS
      boxShadow: {
        card: '0 4px 12px rgba(0,0,0,0.08)',
        button: '0 2px 6px rgba(0,0,0,0.1)',
      },

      // SPACING & SIZES (optional, for consistency)
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
    },
  },
  plugins: [],
}
