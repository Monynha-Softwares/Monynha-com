import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { Children, isValidElement } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

import { cn } from '@/lib/utils';

const defaultEase = [0.4, 0, 0.2, 1] as const;

export interface SectionRevealProps<T extends ElementType = 'div'>
  extends Omit<ComponentPropsWithoutRef<T>, 'children' | 'className'> {
  readonly as?: T;
  readonly children: ReactNode;
  readonly className?: string;
  readonly delay?: number;
  readonly duration?: number;
  readonly offset?: number;
  readonly once?: boolean;
  readonly viewportMargin?: string;
}

export function SectionReveal<T extends ElementType = 'div'>(props: SectionRevealProps<T>) {
  const {
    as,
    children,
    className,
    delay = 0,
    duration = 0.6,
    offset = 40,
    once = true,
    viewportMargin = '-100px',
    ...rest
  } = props;

  const Component = (as ?? 'div') as ElementType;
  const MotionComponent = motion(Component);
  const prefersReducedMotion = useReducedMotion();

  const transition = { duration, delay, ease: defaultEase };

  if (prefersReducedMotion) {
    return (
      <Component className={className} {...(rest as ComponentPropsWithoutRef<T>)}>
        {children}
      </Component>
    );
  }

  return (
    <MotionComponent
      {...(rest as ComponentPropsWithoutRef<T>)}
      className={cn('will-change-transform motion-safe:transform-gpu', className)}
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: viewportMargin }}
      transition={transition}
    >
      {children}
    </MotionComponent>
  );
}

export interface RevealStaggerProps<T extends ElementType = 'div'>
  extends Omit<ComponentPropsWithoutRef<T>, 'children' | 'className'> {
  readonly as?: T;
  readonly children: ReactNode;
  readonly className?: string;
  readonly delayChildren?: number;
  readonly once?: boolean;
  readonly staggerChildren?: number;
  readonly viewportMargin?: string;
}

const staggerVariants = (staggerChildren = 0.12, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: {
      delayChildren,
      staggerChildren,
    },
  },
});

export function RevealStagger<T extends ElementType = 'div'>(props: RevealStaggerProps<T>) {
  const {
    as,
    children,
    className,
    delayChildren = 0,
    once = true,
    staggerChildren = 0.12,
    viewportMargin = '-100px',
    ...rest
  } = props;

  const Component = (as ?? 'div') as ElementType;
  const MotionComponent = motion(Component);
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <Component className={className} {...(rest as ComponentPropsWithoutRef<T>)}>
        {children}
      </Component>
    );
  }

  return (
    <MotionComponent
      {...(rest as ComponentPropsWithoutRef<T>)}
      className={cn(className)}
      variants={staggerVariants(staggerChildren, delayChildren) as Variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: viewportMargin }}
    >
      {Children.map(children, (child) =>
        isValidElement(child)
          ? child
          : <RevealItem key={typeof child === 'string' ? child : undefined}>{child}</RevealItem>,
      )}
    </MotionComponent>
  );
}

export interface RevealItemProps<T extends ElementType = 'div'>
  extends Omit<ComponentPropsWithoutRef<T>, 'children' | 'className'> {
  readonly as?: T;
  readonly children: ReactNode;
  readonly className?: string;
  readonly duration?: number;
  readonly offset?: number;
}

const itemVariants = (offset: number, duration: number): Variants => ({
  hidden: { opacity: 0, y: offset },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration,
      ease: defaultEase,
    },
  },
});

export function RevealItem<T extends ElementType = 'div'>(props: RevealItemProps<T>) {
  const { as, children, className, duration = 0.5, offset = 32, ...rest } = props;

  const Component = (as ?? 'div') as ElementType;
  const MotionComponent = motion(Component);
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <Component className={className} {...(rest as ComponentPropsWithoutRef<T>)}>
        {children}
      </Component>
    );
  }

  return (
    <MotionComponent
      {...(rest as ComponentPropsWithoutRef<T>)}
      className={cn('will-change-transform motion-safe:transform-gpu', className)}
      variants={itemVariants(offset, duration)}
    >
      {children}
    </MotionComponent>
  );
}

SectionReveal.displayName = 'SectionReveal';
RevealStagger.displayName = 'RevealStagger';
RevealItem.displayName = 'RevealItem';
