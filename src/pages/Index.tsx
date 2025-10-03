import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';
import Meta from '@/components/Meta';
import TeamSection from '@/components/TeamSection';
import NewsletterSection from '@/components/NewsletterSection';
import { SilkBackground } from '@/components/reactbits/SilkBackground';
import { SplitText } from '@/components/reactbits/SplitText';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
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

import type { TFunction } from 'i18next';

type LayoutVariant = 'classic' | 'creative';

type DisplaySolution = {
  name: string;
  description: string;
  features: string[];
  gradient: string;
};

type DisplayFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
  url: string;
};

interface HeroProps {
  t: TFunction;
}

interface CreativeHeroProps extends HeroProps {
  spotlightSolution: DisplaySolution | null;
  contactCta: string;
  solutionsCta: string;
}

const parseHeroHeadline = (headline: string) => {
  const [firstLineRaw = '', secondLineRaw = ''] = headline.split('<0/>');
  const sanitize = (value: string) => value.replace(/<[^>]+>/g, '').trim();

  return {
    firstLine: sanitize(firstLineRaw),
    secondLine: sanitize(secondLineRaw),
  };
};

const CreativeHero = ({ t, spotlightSolution, contactCta, solutionsCta }: CreativeHeroProps) => {
  const { firstLine, secondLine } = parseHeroHeadline(t('index.hero.headline'));

  const features = spotlightSolution?.features?.slice(0, 3) ?? [];

  return (
    <section className="relative isolate overflow-hidden">
      <SilkBackground className="absolute inset-0 -z-10" />
      <div className="container relative z-10 mx-auto flex flex-col items-center gap-12 px-4 py-24 sm:px-6 sm:py-32 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-2xl flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
            {t('navigation.home', 'Home')}
          </div>
          <div className="space-y-4">
            <h1 className="font-heading text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
              <SplitText as="span" text={firstLine} className="block" />
              <SplitText
                as="span"
                text={secondLine}
                className="block bg-gradient-to-r from-primary/90 via-secondary/80 to-primary/90 bg-clip-text text-transparent"
              />
            </h1>
            <p className="max-w-xl text-lg text-white/80 sm:text-xl">{t('index.hero.description')}</p>
          </div>
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-start">
            <Button size="lg" className="w-full justify-center sm:w-auto" asChild>
              <Link to="/contact">
                {contactCta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full justify-center border-white/30 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
              asChild
            >
              <Link to="/solutions">{solutionsCta}</Link>
            </Button>
          </div>
        </div>
        <SpotlightCard className="w-full max-w-lg border-white/20 bg-white/10 text-white shadow-creative-card">
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                {t('index.solutions.title')}
              </span>
              <h2 className="font-heading text-2xl font-semibold text-white">
                {spotlightSolution?.name ?? t('index.hero.cta')}
              </h2>
              <p className="text-sm text-white/70">
                {spotlightSolution?.description ?? t('index.hero.description')}
              </p>
            </div>
            {features.length > 0 && (
              <ul className="space-y-3 text-sm text-white/80">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
            <Button
              variant="secondary"
              size="lg"
              className="w-full justify-center bg-white text-foreground hover:bg-white/90"
              asChild
            >
              <Link to="/solutions">{t('index.learnMore')}</Link>
            </Button>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
};

const ClassicHero = ({ t }: HeroProps) => (
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
);

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
  const { data: features } = useQuery<DisplayFeature[]>({
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
      })) as DisplayFeature[];
    },
  });

  // Fetch dynamic solutions from database
  const { data: solutions } = useQuery<DisplaySolution[]>({
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
      })) as DisplaySolution[];
    },
  });

  // Fallback features for loading/error states
  const fallbackFeatures = useMemo<DisplayFeature[]>(
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
  const fallbackSolutions = useMemo<DisplaySolution[]>(
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

  const layoutVariant: LayoutVariant = 'creative';
  const isCreativeLayout = layoutVariant === 'creative';
  const contactCta = t('index.hero.cta');
  const solutionsCta = t('index.hero.viewSolutions');
  const spotlightSolution = displaySolutions.length > 0 ? displaySolutions[0] : null;

  return (
    <Layout variant={layoutVariant}>
      <Meta
        title="Monynha Softwares: Technology with pride, diversity, and resistance"
        description={t('index.hero.description')}
        ogTitle="Monynha Softwares: Technology with pride, diversity, and resistance"
        ogDescription={t('index.hero.description')}
        ogImage="/placeholder.svg"
      />
      {isCreativeLayout ? (
        <CreativeHero
          t={t}
          spotlightSolution={spotlightSolution}
          contactCta={contactCta}
          solutionsCta={solutionsCta}
        />
      ) : (
        <ClassicHero t={t} />
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
