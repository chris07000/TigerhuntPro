/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // PARASITE mining pool theme colors
        background: '#000000', // Pure black background
        foreground: '#ffffff', // White text
        
        primary: {
          DEFAULT: '#ffffff', // White primary
          foreground: '#000000',
        },
        secondary: {
          DEFAULT: '#1a1a1a', // Very dark gray
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#333333', // Medium gray for borders
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#0a0a0a', // Almost black
          foreground: '#888888', // Light gray text
        },
        
        card: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)', // Very subtle white overlay
          foreground: '#ffffff',
        },
        
        border: 'rgba(255, 255, 255, 0.1)', // Subtle white border
        input: '#1a1a1a', // Dark input background
        ring: '#ffffff', // White focus ring
        
        // Minimal color scheme
        success: '#ffffff',
        warning: '#ffffff', 
        error: '#ffffff',
        info: '#ffffff',
      },
      
      fontFamily: {
        mono: ['Consolas', 'Monaco', 'Courier New', 'monospace'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      
      boxShadow: {
        'subtle': '0 1px 3px rgba(255, 255, 255, 0.1)',
        'card': '0 2px 8px rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
} 