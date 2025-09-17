import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase';
import { Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  linkedin_url: string | null;
}

const TeamSection = () => {
  const { t } = useTranslation();

  const {
    data: members,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as TeamMember[];
    },
  });

  const sectionClasses =
    'relative overflow-hidden py-24 bg-gradient-to-b from-white/90 via-neutral-50/80 to-white transition-colors dark:from-neutral-950/85 dark:via-neutral-950 dark:to-neutral-950';

  if (isLoading) {
    return (
      <section className={sectionClasses}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-purple/12 blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 h-56 w-56 rounded-full bg-brand-blue/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-neutral-900 dark:text-neutral-100 lg:text-4xl">
              {t('team.title')}
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-neutral-600 dark:text-neutral-300">
              {t('team.loading')}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {[...Array(4)].map((_, i) => (
              <Card
                key={i}
                className="w-full animate-pulse rounded-[1.75rem] border border-white/30 bg-white/90 shadow-soft dark:border-neutral-800/60 dark:bg-neutral-950/70 md:w-1/2 lg:w-1/4"
              >
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                  <div className="mx-auto mb-2 h-6 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
                  <div className="mx-auto mb-4 h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
                  <div className="mx-auto h-16 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={sectionClasses}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-purple/12 blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 h-56 w-56 rounded-full bg-brand-blue/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-neutral-900 dark:text-neutral-100 lg:text-4xl">
            {t('team.title')}
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            {t('team.error')}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClasses}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-purple/12 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 h-56 w-56 rounded-full bg-brand-blue/15 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-neutral-900 dark:text-neutral-100 lg:text-4xl">
            {t('team.title')}
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-neutral-600 dark:text-neutral-300">
            {t('team.description')}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {members?.map((member) => (
            <Card
              key={member.id}
              className="card-hover w-full rounded-[1.75rem] border border-white/30 bg-white/95 text-neutral-900 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-lg dark:border-neutral-800/60 dark:bg-neutral-950/80 dark:text-neutral-100 md:w-1/2 lg:w-1/4"
            >
              <CardContent className="p-8 text-center">
                <Avatar className="mx-auto mb-6 h-24 w-24 border-4 border-white/60 shadow-soft dark:border-neutral-800">
                  <AvatarImage
                    src={member.image_url || undefined}
                    alt={member.name}
                  />
                  <AvatarFallback className="bg-gradient-hero text-xl font-semibold text-white">
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>

                <h3 className="mb-1 text-xl font-semibold">{member.name}</h3>

                <p className="mb-4 font-medium text-brand-blue">{member.role}</p>

                {member.bio && (
                  <p className="mb-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                    {member.bio}
                  </p>
                )}

                {member.linkedin_url && (
                  <Button
                    size="sm"
                    aria-label={t('team.linkedin')}
                    className="rounded-full bg-gradient-brand px-5 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:shadow-soft-lg focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                    onClick={() => window.open(member.linkedin_url!, '_blank')}
                  >
                    <Linkedin className="h-4 w-4" />
                    <span className="sr-only">{t('team.linkedin')}</span>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
