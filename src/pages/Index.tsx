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

  const heroStats = useMemo(
    () => [
      { value: '120+', label: t('team.stats.projects') },
      { value: '98%', label: t('team.stats.satisfaction') },
      { value: '24/7', label: t('team.stats.support') },
    ],
    [t]
  );

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
      <section className="relative overflow-hidden rounded-b-[3rem] bg-gradient-hero text-white shadow-[0_60px_140px_-60px_rgba(91,44,111,0.6)]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-brand-purple/80 via-brand-blue/60 to-brand-pink/50"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_15%_20%,rgba(247,181,0,0.18),transparent_60%),radial-gradient(circle_at_85%_15%,rgba(74,144,226,0.2),transparent_55%),radial-gradient(circle_at_40%_85%,rgba(224,102,102,0.2),transparent_60%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white/80 shadow-[0_15px_45px_-35px_rgba(255,255,255,0.8)] backdrop-blur-sm">
              {t('footer.tagline')}
            </span>
            <h1 className="text-4xl font-bold leading-[1.1] text-white drop-shadow-[0_20px_45px_rgba(15,23,42,0.25)] lg:text-6xl">
              <Trans
                i18nKey="index.hero.headline"
                components={[
                  <br key="lb" />,
                  <span
                    key="gradient"
                    className="text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-orange/80 to-brand-blue/80"
                  />,
                ]}
              />
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-white/80 lg:text-2xl">
              {t('index.hero.description')}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/contact">
                <Button className="btn-primary px-8 py-4 text-lg">
                  {t('index.hero.cta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/solutions">
                <Button className="btn-secondary px-8 py-4 text-lg">
                  {t('index.hero.viewSolutions')}
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid w-full gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/25 bg-white/10 px-6 py-5 text-left shadow-[0_25px_65px_-35px_rgba(15,23,42,0.45)] backdrop-blur-md"
                >
                  <p className="text-3xl font-semibold text-white sm:text-4xl">{stat.value}</p>
                  <p className="mt-1 text-sm font-medium text-white/80">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[-120px] h-[240px] bg-gradient-to-b from-brand-blue/35 to-transparent blur-3xl"
        />
      </section>

      {/* Features Section */}
      <section className="relative py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-full bg-surface-glow opacity-70 blur-[140px]"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              {t('index.why.title')}
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              {t('index.why.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {displayFeatures.map((feature, index) => (
              <a
                key={index}
                href={feature.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <Card className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-[0_25px_65px_-35px_rgba(91,44,111,0.35)] transition-all duration-300 hover:-translate-y-2 hover:shadow-soft-lg dark:border-neutral-800/70 dark:bg-neutral-900/70">
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink"
                  />
                  <CardContent className="relative z-10 p-8 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-[0_20px_45px_-25px_rgba(91,44,111,0.45)] ring-4 ring-white/25 dark:ring-white/10">
                      <feature.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-300">{feature.description}</p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Preview */}
      <section className="relative py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-10 h-[65%] rounded-[3rem] bg-gradient-to-br from-brand-purple/10 via-white/30 to-brand-blue/10 blur-[180px]"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              {t('index.solutions.title')}
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              {t('index.solutions.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {displaySolutions.map((solution, index) => (
              <Card
                key={index}
                className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_30px_80px_-45px_rgba(91,44,111,0.45)] transition-all duration-300 hover:-translate-y-2 hover:shadow-soft-lg dark:border-neutral-800/70 dark:bg-neutral-900/75"
              >
                <div
                  aria-hidden="true"
                  className={`h-2 bg-gradient-to-r ${solution.gradient}`}
                />
                <CardContent className="relative z-10 p-8">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                    {solution.name}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                    {solution.description}
                  </p>
                  {solution.features &&
                    Array.isArray(solution.features) &&
                    solution.features.length > 0 && (
                      <ul className="space-y-3 mb-8">
                        {solution.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-center text-neutral-700 dark:text-neutral-300"
                          >
                            <CheckCircle className="mr-3 h-5 w-5 text-brand-purple" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  <Link to="/solutions">
                    <Button className="btn-secondary w-full justify-center">
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
        <div
          aria-hidden="true"
          className="absolute inset-x-4 top-0 z-0 mx-auto h-full max-w-5xl rounded-[3rem] bg-gradient-hero shadow-[0_50px_120px_-60px_rgba(91,44,111,0.55)]"
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            {t('index.cta.title')}
          </h2>
          <p className="text-xl text-white/80 mb-8">
            {t('index.cta.description')}
          </p>
          <Link to="/contact">
            <Button className="btn-secondary px-8 py-4 text-lg">
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
