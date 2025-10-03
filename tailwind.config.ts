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
      translate: {
        101: '101%',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          glow: 'hsl(var(--primary-glow, var(--primary)))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          glow: 'hsl(var(--secondary-glow, var(--secondary)))',
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
        'creative-gradient-primary': 'var(--gradient-primary)',
        'creative-gradient-glow': 'var(--gradient-glow)',
        'creative-gradient-mesh': 'var(--gradient-mesh)',
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
        'creative-glow': 'var(--shadow-glow)',
        'creative-depth': 'var(--shadow-depth)',
        'creative-card': 'var(--shadow-card)',
      },
      transitionTimingFunction: {
        'creative-smooth': 'var(--transition-smooth)',
        'creative-spring': 'var(--transition-spring)',
      },
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.925rem + 0.375vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.5rem)',
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.875rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.25rem + 1.25vw, 2.25rem)',
        'fluid-3xl': 'clamp(1.875rem, 1.5rem + 1.875vw, 3rem)',
        'fluid-4xl': 'clamp(2.25rem, 1.75rem + 2.5vw, 4rem)',
        'fluid-5xl': 'clamp(3rem, 2rem + 5vw, 6rem)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
            opacity: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
            opacity: '1',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
            opacity: '1',
          },
          to: {
            height: '0',
            opacity: '0',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(40px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'scale-in': {
          '0%': {
            transform: 'scale(0.9)',
            opacity: '0',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        'glow-pulse': {
          '0%, 100%': {
            opacity: '0.5',
            filter: 'blur(20px)',
          },
          '50%': {
            opacity: '0.8',
            filter: 'blur(30px)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        'reveal-text': {
          '0%': {
            clipPath: 'inset(0 100% 0 0)',
          },
          '100%': {
            clipPath: 'inset(0 0 0 0)',
          },
        },
        marquee: {
          '0%': {
            transform: 'translateX(0%)',
          },
          '100%': {
            transform: 'translateX(-50%)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
        'fade-in-up': 'fade-in-up 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'reveal-text': 'reveal-text 1.2s cubic-bezier(0.77, 0, 0.175, 1)',
        marquee: 'marquee 18s linear infinite',
      },
    },
  },
  plugins: [animatePlugin],
} satisfies Config;
