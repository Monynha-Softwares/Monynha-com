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

  if (isLoading) {
    return (
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-100">
              {t('team.title')}
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-neutral-600 dark:text-neutral-300">
              {t('team.loading')}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {[...Array(4)].map((_, i) => (
              <Card
                key={i}
                className="w-full animate-pulse rounded-2xl border-0 shadow-soft transition-colors md:w-1/2 lg:w-1/4 dark:bg-neutral-900/60"
              >
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="mb-2 h-6 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="mb-4 h-4 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="h-16 rounded bg-neutral-200 dark:bg-neutral-700"></div>
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
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-100">
            {t('team.title')}
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-300">
            {t('team.error')}
          </p>
        </div>
      </section>
    );
  }

  return (
      <section className="relative py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-full bg-surface-glow opacity-60 blur-[180px]"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-100">
              {t('team.title')}
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-neutral-600 dark:text-neutral-300">
              {t('team.description')}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {members?.map((member) => (
              <Card
                key={member.id}
              className="card-hover w-full rounded-2xl border border-white/70 bg-white/90 shadow-[0_25px_65px_-35px_rgba(91,44,111,0.35)] transition-all duration-300 hover:-translate-y-2 hover:shadow-soft-lg md:w-1/2 lg:w-1/4 dark:border-neutral-800/70 dark:bg-neutral-900/75"
              >
                <CardContent className="p-8 text-center">
                  <Avatar className="mx-auto mb-6 h-24 w-24">
                    <AvatarImage
                      src={member.image_url || undefined}
                      alt={member.name}
                    />
                  <AvatarFallback className="bg-gradient-brand text-white text-xl font-semibold">
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                  </AvatarFallback>
                </Avatar>

                <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {member.name}
                </h3>

                <p className="mb-4 font-medium text-brand-purple">
                  {member.role}
                </p>

                {member.bio && (
                  <p className="mb-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                    {member.bio}
                  </p>
                )}

                {member.linkedin_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={t('team.linkedin')}
                    className="rounded-full border-brand-purple/40 text-brand-purple transition-colors hover:bg-brand-purple hover:text-white focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
