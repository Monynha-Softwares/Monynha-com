import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PixelCardProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  className?: string;
  noFocus?: boolean;
}

export const PixelCard = ({
  imageUrl,
  title,
  subtitle,
  footer,
  className,
  noFocus,
}: PixelCardProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        'group relative block overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-xl',
        'transition-all duration-500 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_25px_45px_-20px_rgba(76,0,130,0.35)]',
        className,
      )}
    >
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className={cn(
            'h-full w-full object-cover transition-transform duration-700',
            !reduceMotion && !noFocus && 'group-hover:scale-110',
          )}
          loading="lazy"
        />
        {!reduceMotion && (
          <motion.div aria-hidden initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(132,94,247,0.65),transparent_55%)] mix-blend-screen opacity-0 transition-opacity duration-300 group-hover:opacity-60" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,11,30,0.35)_1px,transparent_1px),linear-gradient(0deg,rgba(10,11,30,0.35)_1px,transparent_1px)] bg-[size:12px_12px] opacity-0 transition-opacity duration-300 group-hover:opacity-70" />
          </motion.div>
        )}
      </div>

      <div className="relative z-10 space-y-3 p-6">
        <div>
          {subtitle && <p className="text-xs uppercase tracking-[0.3em] text-primary/60">{subtitle}</p>}
          <h3 className="text-fluid-xl font-bold text-foreground">{title}</h3>
        </div>
        {footer && <div className="text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
};

PixelCard.displayName = 'PixelCard';

