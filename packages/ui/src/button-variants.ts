import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-base font-semibold transition-all ease-in-out duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-secondary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-soft hover:shadow-soft-lg hover:from-brand-secondary hover:to-brand-primary',
        secondary:
          'bg-white text-brand-primary border border-neutral-200 shadow-soft hover:bg-neutral-50 hover:text-brand-secondary',
        outline:
          'border border-neutral-200 bg-transparent text-neutral-700 hover:bg-neutral-50 hover:text-brand-primary',
        ghost: 'text-brand-primary hover:bg-brand-primary/10',
        link: 'text-brand-secondary underline-offset-4 hover:underline',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-200',
      },
      size: {
        default: 'h-12 px-6',
        sm: 'h-10 px-4 text-sm',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export default buttonVariants;
