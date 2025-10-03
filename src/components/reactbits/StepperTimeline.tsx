import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Step = {
  title: string;
  subtitle?: string;
  description?: string;
  indicator?: string;
};

interface StepperTimelineProps {
  steps: Step[];
  className?: string;
}

export const StepperTimeline = ({ steps, className }: StepperTimelineProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn('relative', className)}>
      <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
      <ul className="space-y-6">
        {steps.map((step, index) => (
          <motion.li
            key={`${step.title}-${index}`}
            initial={reduceMotion ? false : { opacity: 0, x: -16 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative flex items-start gap-6 rounded-2xl border border-border/70 bg-card/60 p-6 backdrop-blur-xl"
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-secondary/70 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_rgba(104,99,255,0.35)]">
              <span>{step.indicator ?? index + 1}</span>
              <span className="absolute inset-0 -z-10 rounded-full bg-primary/30 blur-xl" />
            </div>
            <div className="space-y-1 text-left">
              <p className="text-fluid-lg font-semibold text-foreground">
                {step.title}
              </p>
              {step.subtitle && (
                <p className="text-sm text-primary/70">{step.subtitle}</p>
              )}
              {step.description && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              )}
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

StepperTimeline.displayName = 'StepperTimeline';
