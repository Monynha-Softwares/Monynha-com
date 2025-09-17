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
      <section className="relative overflow-hidden rounded-b-[3rem] bg-gradient-hero text-white shadow-[0_40px_120px_rgba(91,44,111,0.35)]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-brand-purple/40 to-brand-blue/30 opacity-70" />
          <div className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-brand-blue/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-brand-pink/40 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-4xl text-center animate-fade-in">
            <span className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm">
              {t('footer.tagline')}
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              <Trans
                i18nKey="index.hero.headline"
                components={[
                  <br key="lb" />,
                  <span
                    key="gradient"
                    className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-50 to-amber-100"
                  />,
                ]}
              />
            </h1>
            <p className="mt-6 text-lg text-white/85 sm:text-xl lg:text-2xl">
              {t('index.hero.description')}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/contact">
                <Button className="btn-primary px-8 py-4 text-base sm:text-lg">
                  {t('index.hero.cta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/solutions">
                <Button
                  size="lg"
                  className="btn-secondary px-8 py-4 text-base text-brand-purple shadow-none backdrop-blur-sm transition-all duration-300 ease-in-out hover:text-brand-blue"
                >
                  {t('index.hero.viewSolutions')}
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-3 text-sm text-white/80">
              {['ai', 'fast', 'secure'].map((featureKey) => (
                <span
                  key={featureKey}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  {t(`index.why.features.${featureKey}.title`)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 bg-gradient-to-b from-white/85 via-neutral-50/90 to-white transition-colors dark:from-neutral-950/80 dark:via-neutral-950 dark:to-neutral-950">
        <div className="pointer-events-none absolute inset-x-0 top-16 mx-auto h-64 w-64 rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="inline-flex items-center justify-center rounded-full bg-brand-blue/10 px-4 py-1 text-sm font-semibold text-brand-blue">
              {t('navigation.solutions')}
            </span>
            <h2 className="mt-6 text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
              {t('index.why.title')}
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
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
                <div className="relative rounded-[1.75rem] bg-gradient-to-br from-brand-purple/25 via-brand-blue/20 to-brand-pink/20 p-[1px] shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-soft-lg">
                  <div className="pointer-events-none absolute inset-0 rounded-[1.7rem] bg-white/50 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-neutral-900/40" />
                  <Card className="relative h-full rounded-[1.7rem] border border-white/30 bg-white/95 text-neutral-900 backdrop-blur-sm transition-colors dark:border-neutral-800/60 dark:bg-neutral-950/80 dark:text-neutral-100">
                    <CardContent className="p-8 text-center">
                      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero text-white shadow-soft">
                        <feature.icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-semibold">
                        {feature.title}
                      </h3>
                      <p className="mt-3 text-base text-neutral-600 dark:text-neutral-300">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Preview */}
      <section className="relative py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-gradient-to-br from-brand-purple/10 via-white to-brand-blue/10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="inline-flex items-center justify-center rounded-full bg-brand-purple/10 px-4 py-1 text-sm font-semibold text-brand-purple">
              {t('index.learnMore')}
            </span>
            <h2 className="mt-6 text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
              {t('index.solutions.title')}
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
              {t('index.solutions.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {displaySolutions.map((solution, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden rounded-[1.75rem] border border-white/40 bg-white/95 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg dark:border-neutral-800/60 dark:bg-neutral-950/80"
              >
                <div className={`h-3 bg-gradient-to-r ${solution.gradient}`} />
                <CardContent className="relative p-8 lg:p-10">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
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
                            className="flex items-center text-neutral-700 dark:text-neutral-300"
                          >
                            <CheckCircle className="mr-3 h-5 w-5 text-brand-blue" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  <Link to="/solutions">
                    <Button className="btn-secondary mt-8 w-full justify-center">
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
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="absolute inset-0 -z-10 bg-black/20" />
        <div className="absolute -top-20 left-1/2 -z-10 h-56 w-56 -translate-x-1/2 rounded-full bg-brand-blue/40 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 -z-10 h-48 w-48 rounded-full bg-brand-orange/40 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            {t('index.cta.title')}
          </h2>
          <p className="mt-4 text-lg text-white/85 sm:text-xl">
            {t('index.cta.description')}
          </p>
          <Link to="/contact">
            <Button
              size="lg"
              className="btn-secondary mt-8 px-8 py-4 text-base font-semibold text-brand-purple shadow-none hover:text-brand-blue"
            >
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
