import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PixelCard } from './PixelCard';

interface RollingGalleryItem {
  id: number | string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  href?: string;
  footer?: ReactNode;
}

interface RollingGalleryProps {
  items: RollingGalleryItem[];
  speed?: number;
}

export const RollingGallery = ({ items, speed = 30 }: RollingGalleryProps) => {
  const reduceMotion = useReducedMotion();
  const duplicated = [...items, ...items];

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-border/70 bg-card/70 p-1 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background opacity-70" />
      <motion.div
        className="flex gap-6 py-8"
        animate={
          reduceMotion
            ? { x: 0 }
            : {
                x: ['0%', '-50%'],
              }
        }
        transition={{
          repeat: reduceMotion ? 0 : Infinity,
          repeatType: 'loop',
          duration: reduceMotion ? 0 : speed,
          ease: 'linear',
        }}
      >
        {duplicated.map((item, index) => {
          const content = (
            <PixelCard
              key={`${item.id}-${index}`}
              imageUrl={item.imageUrl}
              title={item.title}
              subtitle={item.subtitle}
              footer={item.footer}
              className="w-[280px] shrink-0"
              noFocus
            />
          );

          if (item.href) {
            return (
              <Link to={item.href} key={`${item.id}-${index}`} className="shrink-0">
                {content}
              </Link>
            );
          }

          return content;
        })}
      </motion.div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background via-background/70 to-transparent" />
    </div>
  );
};

RollingGallery.displayName = 'RollingGallery';

