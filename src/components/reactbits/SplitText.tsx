import { motion, useReducedMotion } from 'framer-motion';
import { ElementType, Fragment } from 'react';
import { cn } from '@/lib/utils';

interface SplitTextProps {
  as?: ElementType;
  text: string;
  delay?: number;
  stagger?: number;
  className?: string;
}

export const SplitText = ({
  as: Tag = 'h1',
  text,
  delay = 0.2,
  stagger = 0.04,
  className,
}: SplitTextProps) => {
  const reduceMotion = useReducedMotion();
  const segments = text.split('\n');

  if (reduceMotion) {
    return (
      <Tag className={className}>
        {segments.map((line, lineIndex) => (
          <Fragment key={lineIndex}>
            {line}
            {lineIndex < segments.length - 1 && <br />}
          </Fragment>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={cn('inline-flex flex-col', className)}>
      {segments.map((line, lineIndex) => (
        <span key={lineIndex} className="overflow-hidden whitespace-pre">
          {line.split('').map((character, index) => (
            <motion.span
              key={`${lineIndex}-${index}-${character}`}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{
                delay: delay + lineIndex * 0.25 + index * stagger,
                ease: [0.33, 1, 0.68, 1],
                duration: 0.6,
              }}
              className="inline-block will-change-transform"
            >
              {character === ' ' ? '\u00A0' : character}
            </motion.span>
          ))}
          {lineIndex < segments.length - 1 && <br />}
        </span>
      ))}
    </Tag>
  );
};

SplitText.displayName = 'SplitText';
