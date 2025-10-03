import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { FlowingMenu } from './FlowingMenu';

const links = [
  {
    href: '/',
    label: 'Home',
    accent: 'linear-gradient(135deg, rgba(168, 85, 247, 0.7), rgba(99, 102, 241, 0.7))',
  },
  {
    href: '/portfolio',
    label: 'Portfolio',
    accent: 'linear-gradient(135deg, rgba(14, 165, 233, 0.7), rgba(236, 72, 153, 0.7))',
  },
  {
    href: '/about',
    label: 'About',
    accent: 'linear-gradient(135deg, rgba(34, 197, 94, 0.7), rgba(147, 51, 234, 0.7))',
  },
  {
    href: '/contact',
    label: 'Contact',
    accent: 'linear-gradient(135deg, rgba(251, 191, 36, 0.7), rgba(59, 130, 246, 0.7))',
  },
] as const;

export const GooeyNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-6">
      <nav
        className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 backdrop-blur-xl motion-reduce:transition-none min-h-[3.5rem]"
      >
        <Link to="/" className="flex min-w-0 items-center gap-2 py-2">
          <span className="whitespace-nowrap text-[clamp(1.1rem,4vw,1.5rem)] font-semibold text-foreground">
            Art Leo
          </span>
        </Link>
        <div className="hidden items-center gap-4 md:flex">
          {links.map((link) => (
            <motion.div key={link.href} className="relative">
              <Link
                to={link.href}
                className={cn(
                  'relative inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive(link.href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {link.label}
              </Link>
              {isActive(link.href) && (
                <motion.span
                  layoutId="gooey-active"
                  className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 blur-xl"
                  transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                />
              )}
            </motion.div>
          ))}
        </div>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card/70 p-2 text-foreground motion-reduce:transition-none md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.21, 1, 0.29, 1] }}
              className="mt-3 w-full md:hidden"
            >
              <FlowingMenu
                items={links}
                activeHref={location.pathname}
                onItemClick={() => setOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

GooeyNav.displayName = 'GooeyNav';

