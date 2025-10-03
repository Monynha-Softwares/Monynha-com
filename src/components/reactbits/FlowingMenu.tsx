import { useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import type { FC, MouseEvent } from 'react';
import { Fragment, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface FlowingMenuItem {
  href: string;
  label: string;
  accent?: string;
  external?: boolean;
}

interface FlowingMenuProps {
  items: FlowingMenuItem[];
  activeHref?: string;
  onItemClick?: () => void;
  className?: string;
}

const animationDefaults: gsap.TweenVars = { duration: 0.6, ease: 'expo' };

const findClosestEdge = (
  mouseX: number,
  mouseY: number,
  width: number,
  height: number,
): 'top' | 'bottom' => {
  const topEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY, 2);
  const bottomEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - height, 2);
  return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
};

interface MenuItemProps extends FlowingMenuItem {
  isActive: boolean;
  reduceMotion: boolean;
  onItemClick?: () => void;
}

const defaultAccent = 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)';

const MenuItem: FC<MenuItemProps> = ({
  href,
  label,
  accent,
  external,
  isActive,
  reduceMotion,
  onItemClick,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);

  const handleEnter = (ev: MouseEvent<HTMLAnchorElement>) => {
    if (reduceMotion) return;
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

    const tl = gsap.timeline({ defaults: animationDefaults });
    tl.set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' })
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' })
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' });
  };

  const handleLeave = (ev: MouseEvent<HTMLAnchorElement>) => {
    if (reduceMotion) return;
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

    const tl = gsap.timeline({ defaults: animationDefaults });
    tl.to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' })
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' });
  };

  const accentStyle = useMemo(() => {
    if (!accent) {
      return { background: defaultAccent };
    }

    if (accent.startsWith('url(')) {
      return { backgroundImage: accent };
    }

    if (accent.startsWith('linear') || accent.startsWith('radial') || accent.startsWith('conic')) {
      return { background: accent };
    }

    return { background: accent };
  }, [accent]);

  const repeatedMarqueeContent = useMemo(
    () =>
      Array.from({ length: 4 }).map((_, idx) => (
        <Fragment key={`${label}-${idx}`}>
          <span className="text-[#060010] uppercase font-medium text-[4vh] leading-[1.2] px-[1vw]">{label}</span>
          <div
            className="min-w-[120px] h-[6vh] my-[1.5vh] mx-[1vw] rounded-[999px] bg-cover bg-center"
            style={accentStyle}
          />
        </Fragment>
      )),
    [accentStyle, label],
  );

  const commonLinkProps = {
    className: cn(
      'flex h-full min-h-[64px] w-full items-center justify-center px-6 py-4 text-lg font-semibold uppercase transition-colors',
      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
    ),
    onMouseEnter: handleEnter,
    onMouseLeave: handleLeave,
    onClick: onItemClick,
  } as const;

  return (
    <div
      ref={itemRef}
      className={cn(
        'group relative flex-1 overflow-hidden border-t border-border/40 text-center first:border-t-0',
        isActive ? 'bg-white/5' : undefined,
      )}
    >
      {external ? (
        <a
          {...commonLinkProps}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
        >
          {label}
        </a>
      ) : (
        <Link
          {...commonLinkProps}
          to={href}
        >
          {label}
        </Link>
      )}
      <div
        ref={marqueeRef}
        className="pointer-events-none absolute inset-0 translate-y-[101%] bg-white text-foreground transition-transform duration-500 ease-out"
      >
        <div ref={marqueeInnerRef} className="flex h-full w-[200%]">
          <div className="flex h-full w-[200%] items-center animate-marquee">
            {repeatedMarqueeContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FlowingMenu: FC<FlowingMenuProps> = ({ items, activeHref, onItemClick, className }) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn('w-full overflow-hidden', className)}>
      <nav className="flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl">
        {items.map((item) => (
          <MenuItem
            key={item.href}
            {...item}
            isActive={activeHref === item.href}
            reduceMotion={reduceMotion}
            onItemClick={onItemClick}
          />
        ))}
      </nav>
    </div>
  );
};

FlowingMenu.displayName = 'FlowingMenu';

