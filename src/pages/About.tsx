import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Brain, Target, Users, Award } from 'lucide-react';

import Layout from '@/components/Layout';
import Meta from '@/components/Meta';
import { supabase } from '@/integrations/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

type AboutStat = {
  number: string;
  label: string;
};

type TeamMember = {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
};

type HistoryItem = {
  year: string;
  title: string;
  description: string;
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || name.slice(0, 2).toUpperCase();

const parseStatsValue = (value: unknown): AboutStat[] => {
  const rawArray = (() => {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  })();

  return rawArray
    .map((item) => {
      if (typeof item !== 'object' || item === null) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const numberValue = record.number;
      const labelValue = record.label;

      if (
        (typeof numberValue !== 'string' && typeof numberValue !== 'number') ||
        (typeof labelValue !== 'string' && typeof labelValue !== 'number')
      ) {
        return null;
      }

      return {
        number:
          typeof numberValue === 'string'
            ? numberValue
            : numberValue.toString(),
        label:
          typeof labelValue === 'string'
            ? labelValue
            : labelValue.toString(),
      } satisfies AboutStat;
    })
    .filter((item): item is AboutStat => Boolean(item?.number && item?.label));
};

const About = () => {
  const { t } = useTranslation();

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

  const defaultStats = useMemo(
    () => [
      { number: '50+', label: t('about.stats.projects') },
      { number: '100%', label: t('about.stats.satisfaction') },
      { number: '5+', label: t('about.stats.experience') },
      { number: '24/7', label: t('about.stats.support') },
    ],
    [t]
  );

  const historyItems = useMemo(() => {
    const fallbackDescriptions = [
      t('about.story.p1'),
      t('about.story.p2'),
      t('about.story.p3'),
    ].filter(
      (paragraph): paragraph is string =>
        typeof paragraph === 'string' && paragraph.trim().length > 0
    );

    const fallback = fallbackDescriptions.map((description, index) => ({
      year: `0${index + 1}`,
      title: t('about.storyTitle'),
      description,
    }));

    const rawHistory = t('about.history.milestones', {
      returnObjects: true,
      defaultValue: [],
    }) as unknown;

    if (Array.isArray(rawHistory)) {
      const normalized = rawHistory
        .map((item, index) => {
          if (typeof item !== 'object' || item === null) {
            return null;
          }

          const record = item as Record<string, unknown>;
          const description = record.description;

          if (typeof description !== 'string' || description.trim().length === 0) {
            return null;
          }

          const title = record.title;
          const year = record.year;

          return {
            description,
            title:
              typeof title === 'string' && title.trim().length > 0
                ? title
                : fallback[index]?.title ?? t('about.storyTitle'),
            year:
              typeof year === 'string' && year.trim().length > 0
                ? year
                : fallback[index]?.year ?? `0${index + 1}`,
          } satisfies HistoryItem;
        })
        .filter((item): item is HistoryItem => Boolean(item));

      if (normalized.length > 0) {
        return normalized;
      }
    }

    return fallback;
  }, [t]);

  const {
    data: remoteStats = [],
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ['about-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'about_stats')
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data?.value) {
        return [] as AboutStat[];
      }

      return parseStatsValue(data.value);
    },
    staleTime: 1000 * 60 * 5,
  });

  const displayStats = remoteStats.length > 0 ? remoteStats : defaultStats;
  const statsToRender = statsLoading ? defaultStats : displayStats;

  const {
    data: teamMembers = [],
    isLoading: teamLoading,
    error: teamError,
  } = useQuery({
    queryKey: ['team-members', 'about'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, name, role, image_url')
        .eq('active', true)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as TeamMember[];
    },
  });

  const hasTeamMembers = teamMembers.length > 0;

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
      <section className="py-24 bg-gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-100/80">
                {t('about.missionTitle')}
              </span>
              <h2 className="mt-6 text-3xl font-bold leading-tight lg:text-4xl">
                {t('about.valuesTitle')}
              </h2>
              <p className="mt-6 text-xl leading-relaxed text-blue-100">
                {t('about.mission')}
              </p>
              <div className="mt-10 rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-sm">
                <p className="text-lg leading-relaxed text-blue-100/80">
                  {t('about.valuesDescription')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="border-0 bg-white/10 text-left shadow-soft-lg backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <CardContent className="p-6">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                      <value.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {value.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-blue-100/80">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl">
              {t('about.historyTitle')}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-neutral-600">
              {t('about.historyDescription')}
            </p>
          </div>
          <div className="mt-16 space-y-8">
            {historyItems.map((item, index) => {
              const key = `${item.year}-${index}`;
              return (
                <Card
                  key={key}
                  className="border-0 rounded-3xl shadow-soft-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <CardContent className="p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
                      <div className="flex items-center gap-4">
                        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-2xl font-bold text-white shadow-lg shadow-brand-blue/25">
                          {item.year}
                        </span>
                        <h3 className="text-2xl font-semibold text-neutral-900">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-lg leading-relaxed text-neutral-600 md:mt-0 md:flex-1">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl">
              {t('about.impactTitle')}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-neutral-600">
              {t('about.impactDescription')}
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statsToRender.map((stat, index) => {
              const key = statsLoading
                ? `skeleton-${index}`
                : `${stat.label}-${index}`;

              return statsLoading ? (
                <div
                  key={key}
                  className="rounded-3xl bg-white p-8 shadow-soft-lg"
                >
                  <div className="mx-auto h-10 w-24 rounded-full bg-neutral-200" />
                  <div className="mx-auto mt-4 h-4 w-32 rounded bg-neutral-200" />
                </div>
              ) : (
                <div
                  key={key}
                  className="rounded-3xl bg-white p-8 text-center shadow-soft-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="bg-gradient-brand bg-clip-text text-4xl font-bold text-transparent lg:text-5xl">
                    {stat.number}
                  </div>
                  <div className="mt-2 font-medium text-neutral-600">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl">
              {t('team.title')}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-neutral-600">
              {t('team.description')}
            </p>
          </div>

          <div className="mt-16">
            {teamLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card
                    key={index}
                    className="animate-pulse rounded-3xl border-0 bg-neutral-50 p-8 shadow-soft-lg"
                  >
                    <div className="mx-auto h-24 w-24 rounded-full bg-neutral-200" />
                    <div className="mx-auto mt-6 h-5 w-32 rounded bg-neutral-200" />
                    <div className="mx-auto mt-3 h-4 w-24 rounded bg-neutral-200" />
                  </Card>
                ))}
              </div>
            ) : teamError ? (
              <p className="text-center text-lg text-neutral-600">
                {t('team.error')}
              </p>
            ) : hasTeamMembers ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((member) => (
                  <Card
                    key={member.id}
                    className="border-0 rounded-3xl bg-white text-center shadow-soft-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <CardContent className="p-8">
                      <Avatar className="mx-auto mb-6 h-24 w-24">
                        <AvatarImage
                          src={member.image_url ?? undefined}
                          alt={member.name}
                        />
                        <AvatarFallback className="bg-gradient-hero text-xl font-semibold text-white">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-semibold text-neutral-900">
                        {member.name}
                      </h3>
                      <p className="mt-2 font-medium text-brand-blue">
                        {member.role}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-lg text-neutral-600">
                {t('team.empty')}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-hero text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold leading-tight lg:text-4xl">
            {t('about.cta.title')}
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-blue-100">
            {t('about.cta.description')}
          </p>
          <div className="mt-10 flex justify-center">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white px-8 py-6 text-base font-semibold text-brand-blue shadow-soft-lg transition-colors duration-200 hover:bg-brand-blue hover:text-white"
            >
              <Link to="/contact">{t('about.cta.button')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
