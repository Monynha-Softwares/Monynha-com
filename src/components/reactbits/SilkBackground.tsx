import { useReducedMotion, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SilkBackgroundProps {
  className?: string;
  gradient?: string;
}

const blobs = [
  'radial-gradient(circle at 20% 20%, rgba(136, 88, 255, 0.45), transparent 55%)',
  'radial-gradient(circle at 80% 30%, rgba(72, 139, 255, 0.35), transparent 55%)',
  'radial-gradient(circle at 50% 80%, rgba(170, 80, 255, 0.25), transparent 55%)',
];

const defaultGradient =
  'radial-gradient(at 20% 20%, rgba(109, 76, 255, 0.25), transparent 55%),' +
  'radial-gradient(at 80% 10%, rgba(64, 134, 255, 0.18), transparent 60%),' +
  'radial-gradient(at 50% 80%, rgba(180, 90, 255, 0.12), transparent 55%)';

export const SilkBackground = ({ className, gradient }: SilkBackgroundProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden bg-gradient-to-br from-[#1a1033] via-[#0a0d1f] to-[#06121f]',
        className,
      )}
      role="presentation"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: gradient ?? defaultGradient,
        }}
      />
      <div className="absolute inset-0 backdrop-blur-[120px] opacity-60" />
      {blobs.map((backgroundImage, index) => (
        <motion.div
          key={index}
          className="absolute -top-1/2 left-1/2 h-[140%] w-[140%] opacity-70"
          style={{ backgroundImage }}
          initial={{ rotate: index * 40, scale: 0.9 }}
          animate=
            {reduceMotion
              ? { rotate: index * 40, scale: 0.9 }
              : {
                  rotate: [index * 40, index * 40 + 360],
                  scale: [0.9, 1.05, 0.9],
                }}
          transition={{
            duration: 40 - index * 5,
            repeat: reduceMotion ? 0 : Infinity,
            ease: 'linear',
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0d1f]/60 to-[#060913]" />
    </div>
  );
};

SilkBackground.displayName = 'SilkBackground';

