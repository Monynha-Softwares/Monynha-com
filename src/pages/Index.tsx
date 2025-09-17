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
  LineChart,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
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

  // Fetch dynamic homepage features from database
  const { data: features, isLoading: featuresLoading } = useQuery({
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
  const { data: solutions, isLoading: solutionsLoading } = useQuery({
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

  const heroStats = [
    {
      icon: Users,
      value: '120+',
      label: t('index.hero.stats.projects'),
    },
    {
      icon: LineChart,
      value: '30%',
      label: t('index.hero.stats.efficiency'),
    },
    {
      icon: ShieldCheck,
      value: '4.9',
      label: t('index.hero.stats.rating'),
    },
  ];

  const heroHighlightItems = [
    t('index.hero.highlight.items.discovery'),
    t('index.hero.highlight.items.design'),
    t('index.hero.highlight.items.support'),
  ];

  const featureGradients = [
    'from-brand-purple/90 via-brand-blue/80 to-brand-pink/90',
    'from-brand-blue/90 via-brand-pink/80 to-brand-orange/90',
    'from-brand-pink/90 via-brand-orange/80 to-brand-purple/90',
    'from-brand-orange/90 via-brand-blue/80 to-brand-purple/90',
  ];

  return (
    <Layout>
      <Meta
        title="Monynha Softwares: Technology with pride, diversity, and resistance"
        description={t('index.hero.description')}
        ogTitle="Monynha Softwares: Technology with pride, diversity, and resistance"
        ogDescription={t('index.hero.description')}
        ogImage="/placeholder.svg"
      />
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-purple via-brand-blue to-brand-pink" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_62%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pb-32 lg:pt-36">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_minmax(0,0.95fr)]">
            <div className="space-y-10 text-left text-white">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-blue-50 ring-1 ring-white/40">
                <Sparkles className="h-4 w-4" />
                {t('index.hero.tagline')}
              </span>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                <Trans
                  i18nKey="index.hero.headline"
                  components={[
                    <br key="lb" />,
                    <span
                      key="gradient"
                      className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200"
                    />,
                  ]}
                />
              </h1>
              <p className="max-w-2xl text-lg text-blue-100 lg:text-xl">
                {t('index.hero.description')}
              </p>
              <div className="flex flex-col items-start gap-4 sm:flex-row">
                <Link to="/contact">
                  <Button className="btn-primary">
                    {t('index.hero.cta')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/solutions">
                  <Button
                    size="lg"
                    className="btn-secondary border-white/25 bg-white/10 text-white backdrop-blur-sm hover:border-white/40 hover:text-white"
                  >
                    {t('index.hero.viewSolutions')}
                  </Button>
                </Link>
              </div>
              <div className="grid w-full gap-6 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/25 bg-white/10 p-5 backdrop-blur-md"
                  >
                    <stat.icon className="mb-3 h-6 w-6 text-blue-100" />
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="mt-1 text-sm text-blue-100">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/25 blur-3xl" />
              <div className="absolute -bottom-16 left-4 h-40 w-40 rounded-full bg-brand-orange/20 blur-[140px]" />
              <div className="relative rounded-[2.5rem] border border-white/25 bg-white/10 p-1 shadow-[0_30px_70px_-20px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
                <div className="rounded-[2.25rem] bg-white/95 p-8 text-brand-purple shadow-[0_25px_55px_-25px_rgba(91,44,111,0.6)] dark:bg-neutral-950/85 dark:text-white">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-brand-purple/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-brand-purple">
                      {t('index.hero.highlight.tag')}
                    </span>
                    <span className="text-sm font-semibold text-brand-blue">
                      {t('index.hero.highlight.pill')}
                    </span>
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-brand-purple dark:text-white">
                    {t('index.hero.highlight.title')}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                    {t('index.hero.highlight.description')}
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-neutral-600 dark:text-neutral-200">
                    {heroHighlightItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-4 w-4 text-brand-blue" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue">
                    {t('index.hero.highlight.cta')}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24">
        <div className="absolute inset-0 -z-20 bg-white/95 transition-colors dark:bg-neutral-950" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(91,44,111,0.08),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(91,44,111,0.22),_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-purple/10 px-4 py-1 text-sm font-semibold text-brand-purple">
              {t('index.why.tagline')}
            </span>
            <h2 className="mt-6 text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-white">
              {t('index.why.title')}
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
              {t('index.why.description')}
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {displayFeatures.map((feature, index) => (
              <a
                key={index}
                href={feature.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="group relative overflow-hidden rounded-[1.75rem] border border-brand-purple/10 bg-white/90 shadow-[0_24px_60px_-30px_rgba(91,44,111,0.6)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_30px_70px_-28px_rgba(74,144,226,0.6)] dark:border-white/10 dark:bg-neutral-900/70">
                  <CardContent className="relative h-full p-8">
                    <div
                      className={`absolute right-6 top-6 h-14 w-14 rounded-full bg-gradient-to-br ${featureGradients[index % featureGradients.length]} opacity-20 blur-xl transition-all duration-300 group-hover:opacity-40`}
                    />
                    <div
                      className={`relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${featureGradients[index % featureGradients.length]} text-white shadow-[0_16px_35px_-18px_rgba(91,44,111,0.8)]`}
                    >
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-left text-xl font-semibold text-neutral-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-left text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                      {feature.description}
                    </p>
                    <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue transition-all duration-300 group-hover:gap-3">
                      {t('index.learnMore')}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Preview */}
      <section className="relative py-24">
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-white via-white to-white transition-colors dark:from-neutral-950 dark:via-neutral-950/95 dark:to-neutral-950" />
        <div className="absolute inset-x-0 top-0 -z-10 h-2/3 bg-[radial-gradient(circle_at_top,_rgba(74,144,226,0.12),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(74,144,226,0.25),_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue/10 px-4 py-1 text-sm font-semibold text-brand-blue">
              {t('index.solutions.tagline')}
            </span>
            <h2 className="mt-6 text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-white">
              {t('index.solutions.title')}
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
              {t('index.solutions.description')}
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
            {displaySolutions.map((solution, index) => (
              <Card
                key={index}
                className="relative overflow-hidden rounded-[2rem] border border-brand-purple/10 bg-white/95 shadow-[0_30px_70px_-35px_rgba(74,144,226,0.6)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_35px_85px_-30px_rgba(91,44,111,0.55)] dark:border-white/10 dark:bg-neutral-900/70"
              >
                <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-r ${solution.gradient} opacity-90`} />
                <CardContent className="relative p-10 pt-24">
                  <div className="absolute left-10 top-8 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-purple shadow-[0_12px_40px_-25px_rgba(15,23,42,0.55)] dark:bg-neutral-950/70 dark:text-white">
                    {t('index.solutions.badge')}
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {solution.name}
                  </h3>
                  <p className="mt-3 text-neutral-600 dark:text-neutral-300">
                    {solution.description}
                  </p>
                  {solution.features &&
                    Array.isArray(solution.features) &&
                    solution.features.length > 0 && (
                      <ul className="mt-6 space-y-3">
                        {solution.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300"
                          >
                            <CheckCircle className="h-5 w-5 text-brand-blue" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  <Link to="/solutions" className="mt-10 block">
                    <Button className="btn-primary w-full justify-center text-base">
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
      <section className="relative py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(91,44,111,0.18),_transparent_65%)]" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2.6rem] border border-brand-purple/30 bg-gradient-to-br from-brand-purple via-brand-blue to-brand-pink p-[1px] shadow-[0_32px_85px_-30px_rgba(15,23,42,0.55)]">
            <div className="rounded-[2.5rem] bg-white/92 px-8 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm dark:bg-neutral-950/85">
              <span className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-purple/15 px-4 py-1 text-sm font-semibold text-brand-purple">
                {t('index.cta.tagline')}
              </span>
              <h2 className="mt-6 text-3xl lg:text-4xl font-bold text-brand-purple dark:text-white">
                {t('index.cta.title')}
              </h2>
              <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
                {t('index.cta.description')}
              </p>
              <Link to="/contact" className="mt-10 inline-block">
                <Button className="btn-primary px-10 py-3 text-base">
                  {t('index.cta.getStarted')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
