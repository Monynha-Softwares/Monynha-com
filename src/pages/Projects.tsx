import { useQuery } from '@tanstack/react-query';
import { Github, ExternalLink, Calendar } from 'lucide-react';
import Layout from '../components/Layout';
import Meta from '@/components/Meta';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';

interface Repository {
  id: string;
  name: string;
  description: string;
  github_url: string;
  demo_url: string | null;
  tags: string[];
  created_at: string;
}

const Projects = () => {
  const { t } = useTranslation();

  const {
    data: repositories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['repositories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('repositories')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <Meta
          title="Open Source Projects - Monynha Softwares Agency"
          description={t('projects.description')}
          ogTitle="Open Source Projects - Monynha Softwares Agency"
          ogDescription={t('projects.description')}
          ogImage="/placeholder.svg"
        />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <Meta
          title="Open Source Projects - Monynha Softwares Agency"
          description={t('projects.description')}
          ogTitle="Open Source Projects - Monynha Softwares Agency"
          ogDescription={t('projects.description')}
          ogImage="/placeholder.svg"
        />
        <div className="container mx-auto px-4 py-16 text-center">
          Error loading projects
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Meta
        title="Open Source Projects - Monynha Softwares Agency"
        description={t('projects.description')}
        ogTitle="Open Source Projects - Monynha Softwares Agency"
        ogDescription={t('projects.description')}
        ogImage="/placeholder.svg"
      />
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{t('navigation.home')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('navigation.projects')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            <Trans
              i18nKey="projects.title"
              components={[
                <span
                  key="highlight"
                  className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent"
                />,
              ]}
            />
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            {t('projects.description')}
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {repositories.map((repo) => (
            <Card key={repo.id} className="card-hover border-0 shadow-soft">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl font-semibold text-neutral-900 mb-2">
                    {repo.name}
                  </CardTitle>
                  <div className="flex items-center text-sm text-neutral-500 gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(repo.created_at)}
                  </div>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  {repo.description}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Tags */}
                {repo.tags && repo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {repo.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-all ease-in-out duration-300"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    asChild
                    variant="default"
                    className="flex-1 bg-gradient-to-r from-brand-purple to-brand-blue hover:shadow-soft-lg transition-all ease-in-out duration-300"
                  >
                    <a
                      href={repo.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <Github className="w-4 h-4" />
                      {t('projects.viewGithub')}
                    </a>
                  </Button>

                  {repo.demo_url && (
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 border-neutral-200 hover:border-brand-blue hover:text-brand-blue transition-all ease-in-out duration-300"
                    >
                      <a
                        href={repo.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {t('projects.liveDemo')}
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
            {t('projects.like')}
          </h3>
          <p className="text-neutral-600 mb-8 max-w-2xl mx-auto">
            {t('projects.likeDescription')}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-brand-pink to-brand-orange hover:shadow-soft-lg transition-all ease-in-out duration-300"
          >
            <Link to="/contact">{t('projects.contactUs')}</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Projects;
