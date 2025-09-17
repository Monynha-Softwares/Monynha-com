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
      <section className="relative py-24">
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-white via-white to-white transition-colors dark:from-neutral-950 dark:via-neutral-950/95 dark:to-neutral-950" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(91,44,111,0.08),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(91,44,111,0.25),_transparent_65%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
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
                className="w-full animate-pulse rounded-[1.75rem] border border-brand-purple/10 bg-white/85 shadow-[0_24px_60px_-30px_rgba(91,44,111,0.5)] transition-colors md:w-1/2 lg:w-1/4 dark:border-white/10 dark:bg-neutral-900/60"
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
      <section className="relative py-24">
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-white via-white to-white transition-colors dark:from-neutral-950 dark:via-neutral-950/95 dark:to-neutral-950" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(91,44,111,0.08),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(91,44,111,0.25),_transparent_65%)]" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
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
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-white via-white to-white transition-colors dark:from-neutral-950 dark:via-neutral-950/95 dark:to-neutral-950" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(91,44,111,0.08),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(91,44,111,0.25),_transparent_65%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
              className="card-hover w-full rounded-[1.75rem] border border-brand-purple/10 bg-white/90 shadow-[0_24px_60px_-30px_rgba(91,44,111,0.5)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_32px_70px_-28px_rgba(74,144,226,0.55)] md:w-1/2 lg:w-1/4 dark:border-white/10 dark:bg-neutral-900/80"
            >
              <CardContent className="p-8 text-center">
                <Avatar className="mx-auto mb-6 h-24 w-24">
                  <AvatarImage
                    src={member.image_url || undefined}
                    alt={member.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-brand-purple via-brand-blue to-brand-pink text-xl font-semibold text-white">
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>

                <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {member.name}
                </h3>

                <p className="mb-4 font-medium text-brand-blue">
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
                    className="rounded-full border-brand-blue text-brand-blue transition-colors hover:bg-brand-blue hover:text-white focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
