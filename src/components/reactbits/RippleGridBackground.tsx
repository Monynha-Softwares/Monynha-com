import { useReducedMotion, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RippleGridBackgroundProps {
  className?: string;
}

export const RippleGridBackground = ({ className }: RippleGridBackgroundProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn('absolute inset-0 overflow-hidden rounded-[2.5rem]', className)} aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0418] via-[#050912] to-[#02050d]" />
      <motion.div
        className="absolute inset-0"
        animate={
          reduceMotion
            ? { backgroundPosition: 'center' }
            : {
                backgroundPosition: ['0% 0%', '100% 100%'],
              }
        }
        transition={{
          repeat: reduceMotion ? 0 : Infinity,
          repeatType: 'mirror',
          duration: reduceMotion ? 0 : 14,
          ease: 'easeInOut',
        }}
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(108, 92, 255, 0.25) 0%, transparent 55%),' +
            'radial-gradient(circle at 15% 20%, rgba(64, 146, 255, 0.2) 0%, transparent 50%),' +
            'linear-gradient(90deg, rgba(12, 16, 34, 0.65) 1px, transparent 1px),' +
            'linear-gradient(0deg, rgba(12, 16, 34, 0.65) 1px, transparent 1px)',
          backgroundSize: '240% 240%, 180% 180%, 48px 48px, 48px 48px',
          mixBlendMode: 'screen',
          opacity: 0.85,
        }}
      />
    </div>
  );
};

RippleGridBackground.displayName = 'RippleGridBackground';

