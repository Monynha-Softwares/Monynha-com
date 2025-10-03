import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Layout, { type LayoutVariant } from '@/components/Layout';
import Meta from '@/components/Meta';
import TeamSection from '@/components/TeamSection';
import NewsletterSection from '@/components/NewsletterSection';
import { SilkBackground, SplitText, SpotlightCard } from '@/components/reactbits';
import {
  Brain,
  Zap,
  Shield,
  Users,
  ArrowRight,
  CheckCircle,
  Laptop,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase';
import { useMemo } from 'react';

import { cn } from '@/lib/utils';

const fallbackSolutionsConfig = [
  {
    id: 'boteco',
    gradient: 'from-brand-purple to-brand-blue',
    featureKeys: [
      'orderManagement',
      'inventoryTracking',
      'analyticsDashboard',
      'staffManagement',
    ],
  },
  {
    id: 'assistina',
    gradient: 'from-brand-pink to-brand-orange',
    featureKeys: ['nlp', 'taskAutomation', 'learning', 'integration'],
  },
];

const HOME_LAYOUT_VARIANT: LayoutVariant = 'creative';

const parseHeadlineLines = (headline: string) =>
  headline
    .replace(/<0\s*\/>/g, '\n')
    .replace(/<\/?\d+>/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const Index = () => {
  const { t } = useTranslation();

  // Fetch dynamic homepage features from database
  const { data: features } = useQuery({
    queryKey: ['homepage-features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_features')
        .select('*')
        .eq('active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Map to the expected format with icon components
      const iconMap: Record<string, LucideIcon> = {
        Brain,
        Zap,
        Shield,
        Users,
        Globe,
        Laptop,
      };

      return data.map((feature) => ({
        icon: iconMap[feature.icon as keyof typeof iconMap] ?? Laptop,
        title: feature.title,
        description: feature.description,
        url: feature.url,
      }));
    },
  });

  // Fetch dynamic solutions from database
  const { data: solutions } = useQuery({
    queryKey: ['solutions-preview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('active', true)
        .limit(2)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map((solution, index) => ({
        name: solution.title,
        description: solution.description,
        features: Array.isArray(solution.features)
          ? (solution.features as string[])
          : [],
        gradient:
          index === 0
            ? 'from-brand-purple to-brand-blue'
            : 'from-brand-pink to-brand-orange',
      }));
    },
  });

  // Fallback features for loading/error states
  const fallbackFeatures = useMemo(
    () => [
      {
        icon: Brain,
        title: t('index.why.features.ai.title'),
        description: t('index.why.features.ai.desc'),
        url: '#',
      },
      {
        icon: Zap,
        title: t('index.why.features.fast.title'),
        description: t('index.why.features.fast.desc'),
        url: '#',
      },
      {
        icon: Shield,
        title: t('index.why.features.secure.title'),
        description: t('index.why.features.secure.desc'),
        url: '#',
      },
      {
        icon: Users,
        title: t('index.why.features.support.title'),
        description: t('index.why.features.support.desc'),
        url: '#',
      },
    ],
    [t]
  );

  const displayFeatures = features || fallbackFeatures;
  const heroHeadline = t('index.hero.headline', {
    interpolation: { escapeValue: false },
  });
  const heroLines = useMemo(() => parseHeadlineLines(heroHeadline), [heroHeadline]);
  const layoutVariant: LayoutVariant = HOME_LAYOUT_VARIANT;
  const useCreativeVariant = layoutVariant === 'creative';
  const fallbackSolutions = useMemo(
    () =>
      fallbackSolutionsConfig.map((solution) => ({
        name: t(`index.fallbackSolutions.${solution.id}.name`),
        description: t(`index.fallbackSolutions.${solution.id}.description`),
        features: solution.featureKeys.map((featureKey) =>
          t(`index.fallbackSolutions.${solution.id}.features.${featureKey}`)
        ),
        gradient: solution.gradient,
      })),
    [t]
  );

  const displaySolutions = solutions || fallbackSolutions;

  return (
    <Layout variant={layoutVariant}>
      <Meta
        title="Monynha Softwares: Technology with pride, diversity, and resistance"
        description={t('index.hero.description')}
        ogTitle="Monynha Softwares: Technology with pride, diversity, and resistance"
        ogDescription={t('index.hero.description')}
        ogImage="/placeholder.svg"
      />
      {/* Hero Section */}
      {useCreativeVariant ? (
        <section className="relative px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-background/70 shadow-creative-depth">
              <SilkBackground className="opacity-90" />
              <div className="relative z-10 grid gap-12 px-6 py-20 text-white sm:px-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center">
                <div className="space-y-8 text-center lg:text-left">
                  <div className="space-y-4">
                    {heroLines.map((line, index) => (
                      <SplitText
                        key={`${line}-${index}`}
                        text={line}
                        className={cn(
                          'font-heading text-[clamp(2.5rem,4vw,3.75rem)] font-semibold leading-tight tracking-tight',
                          index === heroLines.length - 1
                            ? 'bg-gradient-to-r from-primary/30 via-secondary/35 to-primary/30 bg-clip-text text-transparent'
                            : 'text-white',
                        )}
                      />
                    ))}
                  </div>
                  <p className="mx-auto max-w-2xl text-base text-blue-100/90 sm:text-lg lg:mx-0 lg:max-w-3xl">
                    {t('index.hero.description')}
                  </p>
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
                    <Link to="/contact" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto">
                        {t('index.hero.cta')}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link to="/solutions" className="w-full sm:w-auto">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full border-white/50 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-white/40 sm:w-auto"
                      >
                        {t('index.hero.viewSolutions')}
                      </Button>
                    </Link>
                  </div>
                </div>
                <SpotlightCard className="h-full bg-background/80 p-8 text-left shadow-creative-card">
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        {t('index.why.title')}
                      </p>
                      <h3 className="mt-2 font-heading text-2xl text-foreground">
                        {t('index.why.description')}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {displayFeatures.slice(0, 3).map((feature, featureIndex) => (
                        <div key={`${feature.title}-${featureIndex}`} className="flex items-start gap-4">
                          <div className="mt-1 rounded-full bg-gradient-to-br from-primary/25 via-secondary/20 to-primary/20 p-2">
                            <feature.icon className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div>
                            <h4 className="font-heading text-lg text-foreground">{feature.title}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link
                      to="/solutions"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                      {t('index.hero.viewSolutions')}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </SpotlightCard>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden bg-gradient-hero text-white">
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply dark:bg-primary/60"></div>
          <div className="container relative z-10 mx-auto flex flex-col items-center py-24 sm:py-28 lg:py-32">
            <div className="animate-fade-in space-y-8 text-center">
              <h1 className="font-heading text-4xl leading-tight sm:text-5xl lg:text-6xl">
                <Trans
                  i18nKey="index.hero.headline"
                  components={[
                    <br key="lb" />,
                    <span
                      key="gradient"
                      className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent"
                    />,
                  ]}
                />
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-blue-100/90 sm:text-xl">
                {t('index.hero.description')}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
                <Link to="/contact">
                  <Button size="lg">
                    {t('index.hero.cta')}

                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/solutions">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/70 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-white/40"
                  >
                    {t('index.hero.viewSolutions')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="bg-white py-24 transition-colors dark:bg-neutral-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="font-heading text-3xl font-semibold text-neutral-900 dark:text-neutral-100 sm:text-4xl">
              {t('index.why.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-neutral-600 dark:text-neutral-300 sm:text-xl">
              {t('index.why.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayFeatures.map((feature, index) => (
              <a
                key={index}
                href={feature.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card
                  variant="elevated"
                  className="cursor-pointer bg-white/90 text-neutral-900 transition-transform dark:bg-neutral-900/70"
                >
                  <CardContent className="space-y-5 px-8 pb-10 pt-10 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Preview */}
      <section className="bg-neutral-50 py-24 transition-colors dark:bg-neutral-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="font-heading text-3xl font-semibold text-neutral-900 dark:text-neutral-100 sm:text-4xl">
              {t('index.solutions.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-neutral-600 dark:text-neutral-300 sm:text-xl">
              {t('index.solutions.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {displaySolutions.map((solution, index) => (
              <Card
                key={index}
                variant="bordered"
                className="overflow-hidden bg-white/95 shadow-soft transition-all dark:bg-neutral-900/80"
              >
                <div
                  className={`h-4 bg-gradient-to-r ${solution.gradient}`}
                ></div>
                <CardContent className="space-y-6 px-8 pb-10 pt-10">
                  <h3 className="font-heading text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {solution.name}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    {solution.description}
                  </p>
                  {solution.features &&
                    Array.isArray(solution.features) &&
                    solution.features.length > 0 && (
                      <ul className="space-y-3">
                        {solution.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-center text-neutral-700 dark:text-neutral-300"
                          >
                            <CheckCircle className="h-5 w-5 text-brand-blue mr-3" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  <Link to="/solutions">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full justify-center"
                    >
                      {t('index.learnMore')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <TeamSection />

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* CTA Section */}
      <section className="bg-gradient-hero py-24 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
            {t('index.cta.title')}
          </h2>
          <p className="mt-6 text-lg text-blue-100/90 sm:text-xl">
            {t('index.cta.description')}
          </p>
          <Link to="/contact">
            <Button size="lg">
              {t('index.cta.getStarted')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
