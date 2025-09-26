import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold tracking-tight shadow-soft transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-primary via-primary/90 to-secondary text-primary-foreground shadow-soft hover:shadow-soft-lg hover:brightness-105 focus-visible:ring-primary/50',
        destructive:
          'bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90 focus-visible:ring-destructive/60',
        outline:
          'border border-primary/40 bg-transparent text-primary shadow-none hover:bg-primary/10 hover:text-primary focus-visible:ring-primary/40',
        secondary:
          'bg-secondary/20 text-secondary hover:bg-secondary/30 hover:text-secondary-foreground shadow-soft',
        ghost:
          'shadow-none text-foreground hover:bg-muted/70 hover:text-foreground/90 focus-visible:ring-primary/30',
        link:
          'shadow-none text-primary underline-offset-8 hover:underline focus-visible:ring-offset-0 px-0 py-0 h-auto',
      },
      size: {
        default: 'px-6 py-3 text-base',
        sm: 'px-4 py-2.5 text-sm',
        lg: 'px-8 py-4 text-lg',
        icon: 'h-12 w-12 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export default buttonVariants;
