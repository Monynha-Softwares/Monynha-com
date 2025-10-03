import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SectionRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

const ease = [0.4, 0, 0.2, 1] as const;

export const SectionReveal = ({ children, delay = 0, className }: SectionRevealProps) => {
  const reduceMotion = useReducedMotion();

  const motionProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-100px' } as const,
        transition: {
          duration: 0.6,
          delay,
          ease,
        },
      };

  return (
    <motion.div
      {...motionProps}
      className={cn(
        'will-change-transform motion-reduce:transform-none motion-reduce:opacity-100',
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

SectionReveal.displayName = 'SectionReveal';

export default SectionReveal;
