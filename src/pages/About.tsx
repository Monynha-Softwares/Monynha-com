import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Brain, Target, Users, Award } from 'lucide-react';
import Layout from '@/components/Layout';
import Meta from '@/components/Meta';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase';
import { useTranslation } from 'react-i18next';

interface TeamMemberCard {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
}

interface AboutStat {
  number: string;
  label: string;
}

const normalizeAboutStats = (value: unknown): AboutStat[] => {
  if (!value) {
    return [];
  }

  let parsedValue: unknown = value;

  if (typeof parsedValue === 'string') {
    try {
      parsedValue = JSON.parse(parsedValue);
    } catch {
      return [];
    }
  }

  if (Array.isArray(parsedValue)) {
    return parsedValue
      .map((item) => {
        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>;
          const number = record.number;
          const label = record.label;

          if ((typeof number === 'string' || typeof number === 'number') && typeof label === 'string') {
            return {
              number: number.toString(),
              label,
            } satisfies AboutStat;
          }
        }
        return null;
      })
      .filter((stat): stat is AboutStat => stat !== null);
  }

  if (typeof parsedValue === 'object' && parsedValue !== null) {
    const record = parsedValue as Record<string, unknown>;
    if (Array.isArray(record.stats)) {
      return normalizeAboutStats(record.stats);
    }
  }

  return [];
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

  const storyTimeline = useMemo(
    () => [t('about.story.p1'), t('about.story.p2'), t('about.story.p3')],
    [t]
  );

  const {
    data: teamMembers,
    isLoading: isTeamLoading,
    error: teamError,
  } = useQuery({
    queryKey: ['team-members', 'about'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, name, role, image_url')
        .eq('active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data ?? []) as TeamMemberCard[];
    },
  });

  const {
    data: aboutStats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['site-settings', 'about-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'about_stats')
        .maybeSingle();

      if (error) throw error;

      return normalizeAboutStats(data?.value);
    },
  });

  return (
    <Layout>
      <Meta
        title={t('meta.about')}
        description={t('about.description')}
        ogTitle={t('meta.about')}
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
      <section className="py-24 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              <div>
                <span className="inline-flex items-center px-4 py-2 text-sm font-medium uppercase tracking-widest rounded-full bg-white/10 text-blue-100">
                  {t('about.missionTitle')}
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                {t('about.description')}
              </h2>
              <p className="text-lg text-blue-100/90 leading-relaxed">
                {t('about.mission')}
              </p>
            </div>
            <div>
              <div className="mb-10">
                <h3 className="text-xl font-semibold uppercase tracking-widest text-blue-100 mb-2">
                  {t('about.valuesTitle')}
                </h3>
                <p className="text-blue-100/80">
                  {t('about.valuesDescription')}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {values.map((value, index) => (
                  <Card
                    key={index}
                    className="border border-white/10 bg-white/10 backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:shadow-lg rounded-2xl"
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center">
                        <value.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">
                          {value.title}
                        </h4>
                        <p className="text-sm text-blue-100/90 leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-8">
              <div>
                <span className="inline-flex items-center px-4 py-2 text-sm font-medium uppercase tracking-widest rounded-full bg-gradient-brand text-white">
                  {t('about.storyTitle')}
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight">
                {t('about.title')}
              </h2>
              <ul className="space-y-6">
                {storyTimeline.map((story, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white font-semibold">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <p className="text-lg text-neutral-600 leading-relaxed">
                      {story}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <Card className="border-0 shadow-soft-lg rounded-3xl overflow-hidden">
                <div className="relative h-80">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Team collaboration"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/40 via-transparent" aria-hidden="true"></div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              {t('about.impactTitle')}
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              {t('about.impactDescription')}
            </p>
          </div>
          {isStatsLoading ? (
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-8"
              role="status"
              aria-live="polite"
            >
              <span className="sr-only">{t('about.statsLoading')}</span>
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 rounded-2xl bg-white shadow-soft animate-pulse"
                  aria-hidden="true"
                ></div>
              ))}
            </div>
          ) : statsError ? (
            <p className="text-center text-neutral-500">{t('about.statsError')}</p>
          ) : aboutStats && aboutStats.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {aboutStats.map((stat, index) => (
                <Card
                  key={`${stat.label}-${index}`}
                  className="border-0 shadow-soft rounded-2xl bg-white text-center p-8"
                >
                  <div className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-brand mb-2">
                    {stat.number}
                  </div>
                  <div className="text-neutral-600 font-medium">{stat.label}</div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral-500">{t('about.statsEmpty')}</p>
          )}
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              {t('team.title')}
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              {t('team.description')}
            </p>
          </div>
          {isTeamLoading ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              role="status"
              aria-live="polite"
            >
              <span className="sr-only">{t('team.loading')}</span>
              {Array.from({ length: 4 }).map((_, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-soft rounded-2xl p-8 animate-pulse h-full"
                  aria-hidden="true"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-neutral-200" />
                    <div className="w-32 h-6 rounded bg-neutral-200" />
                    <div className="w-24 h-4 rounded bg-neutral-200" />
                  </div>
                </Card>
              ))}
            </div>
          ) : teamError ? (
            <p className="text-center text-neutral-500">{t('team.error')}</p>
          ) : teamMembers && teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <Card
                  key={member.id}
                  className="border-0 shadow-soft hover:shadow-soft-lg transition-all duration-200 rounded-2xl"
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <Avatar className="w-24 h-24 mx-auto">
                      <AvatarImage
                        src={member.image_url ?? undefined}
                        alt={member.name}
                      />
                      <AvatarFallback className="bg-gradient-hero text-white text-xl font-semibold">
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold text-neutral-900">
                        {member.name}
                      </h3>
                      <p className="text-brand-blue font-medium">{member.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral-500">{t('team.empty')}</p>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold">
            {t('about.ctaTitle')}
          </h2>
          <p className="text-xl text-blue-100">
            {t('about.ctaDescription')}
          </p>
          <Button asChild size="lg" className="rounded-full px-10">
            <Link to="/contact">{t('about.ctaButton')}</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default About;
