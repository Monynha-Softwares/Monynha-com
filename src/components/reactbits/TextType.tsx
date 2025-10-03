import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextTypeProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}

export const TextType = ({
  text,
  speed = 35,
  delay = 400,
  className,
}: TextTypeProps) => {
  const reduceMotion = useReducedMotion();
  const [displayText, setDisplayText] = useState(reduceMotion ? text : '');
  const characters = useMemo(() => text.split(''), [text]);

  useEffect(() => {
    if (reduceMotion) return;

    let mounted = true;
    const timeout = setTimeout(() => {
      characters.forEach((character, index) => {
        setTimeout(() => {
          if (mounted) {
            setDisplayText((prev) => prev + character);
          }
        }, index * speed);
      });
    }, delay);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [characters, delay, reduceMotion, speed]);

  return (
    <p
      className={cn('font-light text-muted-foreground', className)}
      aria-live="polite"
    >
      {displayText}
      {!reduceMotion && displayText.length < text.length && (
        <span className="inline-block animate-pulse text-primary">|</span>
      )}
    </p>
  );
};

TextType.displayName = 'TextType';
