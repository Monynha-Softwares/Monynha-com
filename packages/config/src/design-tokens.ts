export const brandColors = {
  primary: '#7C3AED',
  primaryForeground: '#FFFFFF',
  secondary: '#0EA5E9',
  secondaryForeground: '#FFFFFF',
  neutral: {
    50: '#F8FAFC',
    100: '#EEF2FF',
    200: '#E2E8F0',
    300: '#CBD5F5',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  accent: {
    pride: ['#FF6B6B', '#FBB13C', '#FFD93D', '#0EA5E9', '#7C3AED', '#8B5CF6'],
  },
};

export const brandFonts = {
  sans: ['"Inter"', 'system-ui', 'sans-serif'].join(', '),
  display: ['"Space Grotesk"', 'system-ui', 'sans-serif'].join(', '),
  mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'].join(', '),
};

export const brandRadii = {
  base: '1rem',
  lg: '1.25rem',
  xl: '1.5rem',
};

export const brandShadows = {
  md: '0 12px 30px rgba(15, 23, 42, 0.12)',
  lg: '0 20px 50px rgba(79, 70, 229, 0.15)',
};

export const brandGradients = {
  primary: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
  pride: `linear-gradient(120deg, ${brandColors.accent.pride.join(', ')})`,
};

export const brandSpacing = {
  containerPadding: '2rem',
};

export const brandTokens = {
  colors: brandColors,
  fonts: brandFonts,
  radii: brandRadii,
  shadows: brandShadows,
  gradients: brandGradients,
  spacing: brandSpacing,
};

export default brandTokens;
