import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Linkedin, Mail } from 'lucide-react';
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
      <section className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              {t('team.title')}
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              {t('team.loading')}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {[...Array(4)].map((_, i) => (
              <Card
                key={i}
                className="w-full md:w-1/2 lg:w-1/4 border-0 shadow-soft rounded-2xl animate-pulse"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-24 h-24 bg-neutral-200 rounded-full mx-auto mb-6"></div>
                  <div className="h-6 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded mb-4"></div>
                  <div className="h-16 bg-neutral-200 rounded"></div>
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
      <section className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            {t('team.title')}
          </h2>
          <p className="text-xl text-neutral-600">{t('team.error')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            {t('team.title')}
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            {t('team.description')}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {members?.map((member) => (
            <Card
              key={member.id}
              className="w-full md:w-1/2 lg:w-1/4 border-0 shadow-soft hover:shadow-soft-lg transition-all duration-200 card-hover rounded-2xl"
            >
              <CardContent className="p-8 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-6">
                  <AvatarImage
                    src={member.image_url || undefined}
                    alt={member.name}
                  />
                  <AvatarFallback className="bg-gradient-hero text-white text-xl font-semibold">
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>

                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {member.name}
                </h3>

                <p className="text-brand-blue font-medium mb-4">
                  {member.role}
                </p>

                {member.bio && (
                  <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
                    {member.bio}
                  </p>
                )}

                {member.linkedin_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={t('team.linkedin')}
                    className="rounded-full border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
                    onClick={() => window.open(member.linkedin_url!, '_blank')}
                  >
                    <Linkedin className="w-4 h-4" />
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
