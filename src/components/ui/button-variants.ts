import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-semibold shadow-md transition-all ease-in-out duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-brand text-white hover:shadow-soft-lg hover:brightness-105',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-brand-blue/30 bg-white text-brand-purple hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 shadow-sm',
        secondary:
          'bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 shadow-sm',
        ghost: 'shadow-none hover:bg-brand-blue/10 hover:text-brand-blue',
        link: 'shadow-none text-brand-blue underline-offset-4 hover:underline px-0',
        brandPrimary:
          'bg-gradient-brand text-white hover:shadow-soft-lg hover:brightness-105',
        brandSecondary:
          'border border-neutral-200 bg-white text-neutral-700 shadow-sm hover:border-brand-blue hover:shadow-soft dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800',
      },
      size: {
        default: 'h-11 px-5 text-base',
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-5 text-base',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export default buttonVariants;
