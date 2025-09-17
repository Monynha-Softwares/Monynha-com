import { brandColors, brandFonts, prideGradient } from '@monynha/ui';

export const siteBrand = {
  name: 'Monynha Softwares',
  shortName: 'Monynha',
  tagline: 'Inclusive technology crafted with pride.',
  colors: brandColors,
  fonts: brandFonts,
  gradients: {
    pride: prideGradient,
  },
  borderRadius: '1.5rem',
} as const;

export type SiteBrand = typeof siteBrand;
