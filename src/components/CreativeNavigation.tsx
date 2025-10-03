import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

import ThemeToggle from './ThemeToggle';
import { GooeyNav, type GooeyNavLink } from './reactbits';

interface SlotConfig {
  desktop?: ReactNode;
  mobile?: ReactNode;
}

interface CreativeNavigationProps {
  navLinks?: ReadonlyArray<GooeyNavLink>;
  brand?: ReactNode;
  languageSwitcher?: SlotConfig;
  themeToggle?: SlotConfig;
  authControls?: SlotConfig;
  marketingCta?: SlotConfig;
  toggleLabel?: string;
}

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
] as const;

const CreativeLanguageSwitcher = ({ variant }: { variant: 'desktop' | 'mobile' }) => {
  const { i18n } = useTranslation();
  const isMobile = variant === 'mobile';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/80 p-1 text-xs font-semibold shadow-creative-card backdrop-blur-md',
        isMobile ? 'w-full justify-center' : undefined,
      )}
    >
      {languages.map((lng) => (
        <button
          key={lng.code}
          type="button"
          onClick={() => i18n.changeLanguage(lng.code)}
          className={cn(
            'rounded-full px-2.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            i18n.language === lng.code
              ? 'bg-primary/20 text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {lng.label}
        </button>
      ))}
    </div>
  );
};

const mergeSlot = (slot: SlotConfig | undefined, fallback: SlotConfig): SlotConfig => ({
  desktop: slot?.desktop ?? fallback.desktop,
  mobile: slot?.mobile ?? fallback.mobile,
});

const defaultBrand = (
  <div className="flex items-center gap-2">
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-pride text-white shadow-creative-glow">
      <span className="text-lg font-bold">M</span>
    </div>
    <span className="font-brand text-[clamp(1.1rem,4vw,1.55rem)] font-semibold text-foreground">
      Mon
      <span className="text-primary">y</span>
      nha
    </span>
  </div>
);

const CreativeNavigation = ({
  navLinks,
  brand,
  languageSwitcher,
  themeToggle,
  authControls,
  marketingCta,
  toggleLabel,
}: CreativeNavigationProps) => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  const defaultLinks = useMemo<ReadonlyArray<GooeyNavLink>>(
    () => [
      {
        href: '/',
        label: t('navigation.home'),
        accent: 'var(--gradient-primary)',
      },
      {
        href: '/solutions',
        label: t('navigation.solutions'),
        accent: 'linear-gradient(135deg, rgba(95, 46, 234, 0.65), rgba(61, 90, 241, 0.65))',
      },
      {
        href: '/projects',
        label: t('navigation.projects'),
        accent: 'linear-gradient(135deg, rgba(14, 165, 233, 0.6), rgba(236, 72, 153, 0.6))',
      },
      {
        href: '/blog',
        label: t('navigation.blog'),
        accent: 'linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(244, 114, 182, 0.6))',
      },
      {
        href: '/about',
        label: t('navigation.about'),
        accent: 'linear-gradient(135deg, rgba(34, 197, 94, 0.6), rgba(147, 51, 234, 0.6))',
      },
      {
        href: '/contact',
        label: t('navigation.contact'),
        accent: 'linear-gradient(135deg, rgba(251, 191, 36, 0.65), rgba(59, 130, 246, 0.65))',
      },
    ],
    [t],
  );

  const linksToUse = navLinks ?? defaultLinks;

  const defaultLanguageSlot: SlotConfig = {
    desktop: <CreativeLanguageSwitcher variant="desktop" />,
    mobile: <CreativeLanguageSwitcher variant="mobile" />,
  };

  const defaultThemeSlot: SlotConfig = {
    desktop: (
      <ThemeToggle
        variant="surface"
        className="h-11 w-11 rounded-full border border-border/60 bg-card/80 text-foreground"
      />
    ),
    mobile: (
      <ThemeToggle
        variant="surface"
        className="h-12 w-12 rounded-full border border-border/60 bg-card/80 text-foreground"
      />
    ),
  };

  const defaultAuthSlot: SlotConfig = user
    ? {
        desktop: (
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[160px] truncate text-xs font-medium text-muted-foreground lg:inline">
              {user.email ?? ''}
            </span>
            <Button
              type="button"
              onClick={signOut}
              className="rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm font-semibold text-foreground shadow-creative-card transition-colors hover:border-primary/50 hover:bg-primary/10"
            >
              {t('dashboard.signOut')}
            </Button>
          </div>
        ),
        mobile: (
          <Button
            type="button"
            onClick={signOut}
            className="w-full rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm font-semibold text-foreground shadow-creative-card transition-colors hover:border-primary/50 hover:bg-primary/10"
          >
            {t('dashboard.signOut')}
          </Button>
        ),
      }
    : {
        desktop: (
          <Button
            asChild
            variant="outline"
            className="rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm font-semibold text-foreground shadow-creative-card transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Link to="/auth">{t('auth.tabs.signin')}</Link>
          </Button>
        ),
        mobile: (
          <Button
            asChild
            variant="outline"
            className="w-full rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm font-semibold text-foreground shadow-creative-card transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Link to="/auth">{t('auth.tabs.signin')}</Link>
          </Button>
        ),
      };

  const defaultMarketingSlot: SlotConfig = {
    desktop: (
      <Button
        asChild
        className="rounded-full bg-gradient-to-r from-primary/70 via-secondary/60 to-primary/70 px-5 py-2 text-sm font-semibold text-white shadow-creative-glow transition hover:shadow-creative-depth"
      >
        <Link to="/contact">{t('navigation.startProject')}</Link>
      </Button>
    ),
    mobile: (
      <Button
        asChild
        className="w-full rounded-full bg-gradient-to-r from-primary/80 via-secondary/60 to-primary/80 px-5 py-2 text-sm font-semibold text-white shadow-creative-glow transition hover:shadow-creative-depth"
      >
        <Link to="/contact">{t('navigation.startProject')}</Link>
      </Button>
    ),
  };

  const languageSlot = mergeSlot(languageSwitcher, defaultLanguageSlot);
  const themeSlot = mergeSlot(themeToggle, defaultThemeSlot);
  const authSlot = mergeSlot(authControls, defaultAuthSlot);
  const marketingSlot = mergeSlot(marketingCta, defaultMarketingSlot);

  return (
    <GooeyNav
      links={linksToUse}
      brand={brand ?? defaultBrand}
      toggleLabel={toggleLabel ?? t('navigation.toggleNavigation')}
      utilities={
        <>
          {themeSlot.desktop}
          {languageSlot.desktop}
          {authSlot.desktop}
          {marketingSlot.desktop}
        </>
      }
      mobileUtilities={
        <div className="rounded-3xl border border-border/60 bg-card/80 p-4 shadow-creative-card backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            {themeSlot.mobile}
            {languageSlot.mobile}
          </div>
          <div className="mt-4 grid gap-3">
            {authSlot.mobile}
            {marketingSlot.mobile}
          </div>
        </div>
      }
    />
  );
};

export default CreativeNavigation;
