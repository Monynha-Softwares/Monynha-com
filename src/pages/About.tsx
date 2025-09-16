import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import Meta from '@/components/Meta';
import TeamSection from '@/components/TeamSection';
import { supabase } from '@/integrations/supabase';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Award,
  Brain,
  CheckCircle2,
  Target,
  Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface MissionHighlight {
  title: string;
  description: string;
}

interface HistoryItem {
  year: string;
  title: string;
  description: string;
}

interface AboutStat {
  number: string;
  label: string;
}

const parseMissionHighlights = (items: unknown): MissionHighlight[] => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (
        item &&
        typeof item === 'object' &&
        'title' in item &&
        'description' in item
      ) {
        const { title, description } = item as {
          title?: unknown;
          description?: unknown;
        };

        if (typeof title === 'string' && typeof description === 'string') {
          return { title, description };
        }
      }

      return null;
    })
    .filter((highlight): highlight is MissionHighlight => Boolean(highlight));
};

const parseHistoryTimeline = (items: unknown): HistoryItem[] => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (
        item &&
        typeof item === 'object' &&
        'year' in item &&
        'title' in item &&
        'description' in item
      ) {
        const { year, title, description } = item as {
          year?: unknown;
          title?: unknown;
          description?: unknown;
        };

        if (
          typeof year === 'string' &&
          typeof title === 'string' &&
          typeof description === 'string'
        ) {
          return { year, title, description };
        }
      }

      return null;
    })
    .filter((entry): entry is HistoryItem => Boolean(entry));
};

const parseStatsValue = (value: unknown): AboutStat[] | null => {
  if (!Array.isArray(value)) return null;

  const stats = value
    .map((item) => {
      if (item && typeof item === 'object') {
        const numberValue =
          'number' in item
            ? (item as { number?: unknown }).number
            : undefined;
        const labelValue =
          'label' in item ? (item as { label?: unknown }).label : undefined;

        const number =
          typeof numberValue === 'number'
            ? numberValue.toString()
            : typeof numberValue === 'string'
              ? numberValue
              : null;
        const label =
          typeof labelValue === 'string' ? labelValue : null;

        if (number && label) {
          return { number, label };
        }
      }

      return null;
    })
    .filter((stat): stat is AboutStat => Boolean(stat));

  return stats.length > 0 ? stats : null;
};

const About = () => {
  const { t } = useTranslation();
  const missionHighlights = useMemo(() => {
    const items = t('about.missionHighlights', { returnObjects: true }) as unknown;
    return parseMissionHighlights(items);
  }, [t]);
  const values = useMemo(
    () => [
      {
        icon: Brain,
        title: t('about.valuesList.innovation'),
        description: t('about.valuesList.innovationDesc'),
      },
      {
        icon: Target,
        title: t('about.valuesList.customer'),
        description: t('about.valuesList.customerDesc'),
      },
      {
        icon: Users,
        title: t('about.valuesList.collaboration'),
        description: t('about.valuesList.collaborationDesc'),
      },
      {
        icon: Award,
        title: t('about.valuesList.quality'),
        description: t('about.valuesList.qualityDesc'),
      },
    ],
    [t]
  );
  const historyTimeline = useMemo(() => {
    const items = t('about.historyTimeline', { returnObjects: true }) as unknown;
    return parseHistoryTimeline(items);
  }, [t]);
  const storyParagraphs = useMemo(
    () => [t('about.story.p1'), t('about.story.p2'), t('about.story.p3')],
    [t]
  );
  const defaultStats = useMemo(
    () => [
      { number: '50+', label: t('about.stats.projects') },
      { number: '100%', label: t('about.stats.satisfaction') },
      { number: '5+', label: t('about.stats.experience') },
      { number: '24/7', label: t('about.stats.support') },
    ],
    [t]
  );
  const historyDescriptionRaw = t('about.historyDescription', {
    defaultValue: '',
  });
  const historyDescription =
    historyDescriptionRaw &&
    historyDescriptionRaw !== 'about.historyDescription'
      ? historyDescriptionRaw
      : t('about.story.p1');
  const { data: statsData, isLoading: statsLoading } = useQuery<
    AboutStat[] | null
  >({
    queryKey: ['site-settings', 'about-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'about_stats')
        .maybeSingle();

      if (error) throw error;

      if (!data?.value) return null;

      return parseStatsValue(data.value);
    },
    staleTime: 1000 * 60 * 5,
  });
  const stats =
    Array.isArray(statsData) && statsData.length > 0
      ? statsData
      : defaultStats;

  return (
    <Layout>
      <Meta
        title="About Monynha Softwares Agency"
        description={t('about.description')}
        ogTitle="About Monynha Softwares Agency"
        ogDescription={t('about.description')}
        ogImage="/placeholder.svg"
      />
      {/* Hero Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
              {t('about.title')}
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              {t('about.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
            <div className="lg:col-span-2 space-y-6">
              <span className="text-sm uppercase tracking-widest text-brand-blue/80 font-semibold">
                {t('about.missionTitle')}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900">
                {t('about.missionHeadline', { defaultValue: t('about.title') })}
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed">
                {t('about.mission')}
              </p>
              <div className="mt-10 space-y-6">
                {missionHighlights.map((highlight, index) => (
                  <div
                    key={`${highlight.title}-${index}`}
                    className="flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-brand-blue" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                        {highlight.title}
                      </h3>
                      <p className="text-neutral-600 text-sm leading-relaxed">
                        {highlight.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
                  {t('about.valuesTitle')}
                </h3>
                <p className="text-neutral-600 max-w-2xl">
                  {t('about.valuesDescription')}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {values.map((value, index) => (
                  <Card
                    key={index}
                    className="border-0 shadow-soft hover:shadow-soft-lg transition-all ease-in-out duration-300 card-hover rounded-2xl h-full"
                  >
                    <CardContent className="p-8">
                      <div className="w-14 h-14 bg-gradient-brand rounded-2xl flex items-center justify-center mb-6">
                        <value.icon className="h-7 w-7 text-white" />
                      </div>
                      <h4 className="text-xl font-semibold text-neutral-900 mb-3">
                        {value.title}
                      </h4>
                      <p className="text-neutral-600 leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <span className="text-sm uppercase tracking-widest text-brand-blue/80 font-semibold">
                {t('about.storyTitle')}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mt-4 mb-6">
                {t('about.historyHeadline', { defaultValue: t('about.title') })}
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed">
                {historyDescription}
              </p>
              {historyTimeline.length > 0 ? (
                <div className="mt-10 space-y-10">
                  {historyTimeline.map((item, index) => (
                    <div key={`${item.year}-${item.title}`} className="relative pl-14">
                      <div className="absolute left-0 top-1 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-brand text-white font-semibold shadow-soft">
                        {item.year}
                      </div>
                      {index !== historyTimeline.length - 1 && (
                        <div className="absolute left-5 top-12 bottom-[-32px] w-px bg-brand-blue/20" aria-hidden="true"></div>
                      )}
                      <h3 className="text-xl font-semibold text-neutral-900">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-neutral-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-10 space-y-6 text-lg text-neutral-600">
                  {storyParagraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Card className="border-0 shadow-soft-lg rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Team collaboration"
                  loading="lazy"
                  className="w-full h-80 object-cover"
                />
                <div className="h-2 bg-gradient-brand"></div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              {t('about.impactTitle')}
            </h2>
            <p className="text-xl text-neutral-600">
              {t('about.impactDescription')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {statsLoading && !Array.isArray(statsData) ? (
              [...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="p-8 rounded-2xl border border-neutral-100 shadow-soft bg-neutral-50 animate-pulse"
                >
                  <div className="h-10 bg-neutral-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                </div>
              ))
            ) : (
              stats.map((stat, index) => (
                <div
                  key={`${stat.label}-${index}`}
                  className="text-center p-8 rounded-2xl border border-neutral-100 shadow-soft bg-white"
                >
                  <div className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-brand mb-3">
                    {stat.number}
                  </div>
                  <div className="text-neutral-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <TeamSection />

      {/* CTA Section */}
      <section className="py-24 bg-gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            {t('about.ctaTitle')}
          </h2>
          <p className="text-lg lg:text-xl text-blue-100 leading-relaxed mb-8">
            {t('about.ctaDescription')}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-brand-blue hover:bg-blue-50 hover:text-brand-blue"
          >
            <a href="/contact" className="inline-flex items-center gap-2">
              {t('about.ctaButton')}
              <ArrowRight className="w-5 h-5" />
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default About;
