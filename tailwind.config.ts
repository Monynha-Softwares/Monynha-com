import type { Config } from 'tailwindcss';
import animatePlugin from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './packages/ui/src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Monynha Softwares Brand Colors
        brand: {
          DEFAULT: '#5F2EEA',
          purple: '#5F2EEA',
          blue: '#3D5AF1',
          pink: '#F472B6',
          orange: '#F59E0B',
        },
        neutral: {
          50: '#F8F8F8',
          100: '#EEEEEE',
          200: '#E2E2E2',
          300: '#D5D5D5',
          400: '#888888',
          500: '#6B6B6B',
          600: '#4F4F4F',
          700: '#333333',
          800: '#1F1F1F',
          900: '#0D0D0D',
          950: '#050505',
        },
      },
      fontFamily: {
        sans: ['"Open Sans"', 'system-ui', 'sans-serif'],
        heading: ['"Poppins"', '"Open Sans"', 'system-ui', 'sans-serif'],
        brand: ['"Poppins"', '"Open Sans"', 'system-ui', 'sans-serif'],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
      backgroundImage: {
        'gradient-brand':
          'linear-gradient(135deg, #5F2EEA 0%, #3D5AF1 30%, #38BDF8 70%, #F59E0B 100%)',
        'gradient-hero': 'linear-gradient(135deg, #5F2EEA 0%, #3D5AF1 100%)',
        'gradient-pride':
          'linear-gradient(135deg, #5F2EEA 0%, #3D5AF1 25%, #22C55E 50%, #F59E0B 75%, #F472B6 100%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 10px 30px -15px rgba(91, 44, 111, 0.35)',
        'soft-lg': '0 25px 60px -20px rgba(74, 144, 226, 0.45)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
      },
    },
  },
  plugins: [animatePlugin],
} satisfies Config;
