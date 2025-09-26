import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva(
  'group relative overflow-hidden rounded-2xl border border-border/60 bg-card/95 text-card-foreground shadow-soft transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/15 focus-within:ring-offset-2 focus-within:ring-offset-background',
  {
    variants: {
      variant: {
        default: '',
        bordered:
          'border-2 border-primary/20 hover:-translate-y-1 hover:shadow-soft-lg',
        elevated:
          'border-transparent shadow-soft-lg hover:-translate-y-1 hover:shadow-soft-lg',
        subtle: 'border-transparent bg-muted/60',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const cardHeaderVariants = cva('flex flex-col gap-2 px-8 py-6 text-left', {
  variants: {
    variant: {
      default: '',
      gradient:
        'relative -mx-8 -mt-6 rounded-t-[1.4rem] bg-gradient-to-r from-primary/15 via-primary/10 to-secondary/20 px-8 py-6 text-foreground dark:text-white',
      muted: 'bg-muted/60 rounded-[1.25rem] px-8 py-6',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardHeaderVariants({ variant, className }))}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-tight tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-8 pb-8 pt-0 text-base leading-relaxed space-y-4',
      className
    )}
    {...props}
  />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-wrap items-center gap-4 px-8 pb-8 pt-0',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
