import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';
import Meta from '@/components/Meta';
import TeamSection from '@/components/TeamSection';
import NewsletterSection from '@/components/NewsletterSection';
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
import { Trans, useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase';
import { useMemo } from 'react';

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

const Index = () => {
  const { t } = useTranslation();

  const { data: features } = useQuery({
    queryKey: ['homepage-features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_features')
        .select('*')
        .eq('active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;

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
  const heroHighlights = displayFeatures.slice(0, 3);

  const fallbackSolutions = useMemo(
    () =>
      fallbackSolutionsConfig.map((solution) => ({
        name: t(`index.fallbackSolutions.${solution.id}.name`),
        description: t(
          `index.fallbackSolutions.${solution.id}.description`
        ),
        features: solution.featureKeys.map((featureKey) =>
          t(`index.fallbackSolutions.${solution.id}.features.${featureKey}`)
        ),
        gradient: solution.gradient,
      })),
    [t]
  );

  const displaySolutions = solutions || fallbackSolutions;

  return (
    <Layout>
      <Meta
        title="Monynha Softwares: Technology with pride, diversity, and resistance"
        description={t('index.hero.description')}
        ogTitle="Monynha Softwares: Technology with pride, diversity, and resistance"
        ogDescription={t('index.hero.description')}
        ogImage="/placeholder.svg"
      />

      <section className="relative overflow-hidden bg-gradient-hero text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_rgba(91,44,111,0.35))]" />
          <div className="absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -left-24 bottom-[-80px] h-72 w-72 rounded-full bg-brand-orange/30 blur-3xl" />
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-blue/30 blur-[120px]" />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-28 text-center sm:px-6 lg:px-8 lg:py-36">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
            {t('index.hero.tagline')}
          </span>
          <h1 className="text-balance text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            <Trans
              i18nKey="index.hero.headline"
              components={[
                <br key="lb" />,
                <span
                  key="gradient"
                  className="text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-blue/80 to-brand-orange/70"
                />,
              ]}
            />
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-white/80 sm:text-xl">
            {t('index.hero.description')}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link to="/contact">
              <Button size="lg" className="btn-primary px-10 py-4 text-base">
                {t('index.hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/solutions">
              <Button
                size="lg"
                className="btn-secondary px-10 py-4 text-base"
              >
                {t('index.hero.viewSolutions')}
              </Button>
            </Link>
          </div>

          {heroHighlights.length > 0 && (
            <div className="mt-16 grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {heroHighlights.map((feature, index) => (
                <div
                  key={`${feature.title}-${index}`}
                  className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:bg-white/15"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/75">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative py-24">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-purple/15 via-transparent to-transparent"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-brand-purple lg:text-4xl">
              {t('index.why.title')}
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              {t('index.why.description')}
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {displayFeatures.map((feature, index) => (
              <a
                key={`${feature.title}-${index}`}
                href={feature.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="card-hover relative overflow-hidden border border-brand-purple/15 bg-white/90 shadow-soft backdrop-blur-md transition-shadow duration-300 hover:border-brand-purple/30 dark:border-neutral-800 dark:bg-neutral-900/80">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink" />
                  <CardContent className="relative p-8">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-purple/10 text-brand-purple">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
                      {feature.description}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue">
                      {t('index.learnMore')}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-blue/15 via-transparent to-transparent"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-brand-purple lg:text-4xl">
              {t('index.solutions.title')}
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              {t('index.solutions.description')}
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
            {displaySolutions.map((solution, index) => (
              <Card
                key={`${solution.name}-${index}`}
                className="card-hover relative overflow-hidden border border-brand-purple/15 bg-white/95 shadow-soft backdrop-blur-md transition-shadow duration-300 hover:border-brand-purple/30 dark:border-neutral-800 dark:bg-neutral-900/85"
              >
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${solution.gradient} opacity-10`}
                  aria-hidden="true"
                />
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${solution.gradient}`}
                  aria-hidden="true"
                />
                <CardContent className="relative p-10">
                  <div className="inline-flex items-center gap-2 rounded-full bg-brand-purple/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-brand-purple/80">
                    {t('navigation.solutions')}
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {solution.name}
                  </h3>
                  <p className="mt-4 text-neutral-600 dark:text-neutral-300">
                    {solution.description}
                  </p>
                  {solution.features &&
                    Array.isArray(solution.features) &&
                    solution.features.length > 0 && (
                      <ul className="mt-8 space-y-3">
                        {solution.features.map((feature, featureIndex) => (
                          <li
                            key={`${feature}-${featureIndex}`}
                            className="flex items-center text-neutral-700 dark:text-neutral-300"
                          >
                            <CheckCircle className="mr-3 h-5 w-5 text-brand-purple" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  <Link to="/solutions">
                    <Button className="btn-primary mt-8 w-full">
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

      <TeamSection />
      <NewsletterSection />

      <section className="px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[3rem] bg-gradient-hero px-6 py-16 text-center text-white shadow-soft-lg sm:px-10 lg:px-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 top-16 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
            <div className="absolute -right-20 bottom-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold lg:text-4xl">
              {t('index.cta.title')}
            </h2>
            <p className="mt-4 text-xl text-white/80">
              {t('index.cta.description')}
            </p>
            <Link to="/contact">
              <Button
                size="lg"
                className="mt-8 rounded-2xl bg-white/90 px-10 py-4 text-lg font-semibold text-brand-purple shadow-soft transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-white"
              >
                {t('index.cta.getStarted')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
