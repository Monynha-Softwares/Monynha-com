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
          DEFAULT: '#7C3AED',
          purple: '#7C3AED',
          blue: '#0EA5E9',
          pink: '#EC4899',
          orange: '#F97316',
          indigo: '#4338CA',
          teal: '#14B8A6',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['"Quicksand"', 'Inter', 'system-ui', 'sans-serif'],
        brand: ['"Quicksand"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      backgroundImage: {
        'gradient-brand':
          'linear-gradient(130deg, #5B2C6F 0%, #4A90E2 40%, #E06666 75%, #F7B500 100%)',
        'gradient-hero':
          'linear-gradient(130deg, #5B2C6F 0%, #4A90E2 55%, #E06666 100%)',
        'gradient-pride':
          'linear-gradient(135deg, #5B2C6F 0%, #4A90E2 25%, #22C55E 50%, #E06666 75%, #F7B500 100%)',
        'gradient-surface':
          'radial-gradient(circle at 20% 20%, rgba(91, 44, 111, 0.18), transparent 55%), radial-gradient(circle at 85% 10%, rgba(74, 144, 226, 0.18), transparent 50%), radial-gradient(circle at 10% 85%, rgba(224, 102, 102, 0.16), transparent 45%), linear-gradient(180deg, #f8f4ff 0%, #ffffff 55%, #fff6f0 100%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 6px)',
        xl: '1.25rem',
        '2xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 18px 45px -22px rgba(91, 44, 111, 0.35)',
        'soft-lg': '0 26px 65px -24px rgba(74, 144, 226, 0.35)',
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
