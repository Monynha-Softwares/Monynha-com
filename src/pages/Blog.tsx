import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import Meta from '@/components/Meta';
import NewsletterSection from '@/components/NewsletterSection';
import { ArrowRight, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation, Trans } from 'react-i18next';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const Blog = () => {
  const { t } = useTranslation();

  const categories = useMemo(
    () => [
      t('blog.categories.all'),
      'AI Insights',
      'Development',
      'Case Study',
      'Business',
      'Security',
      'Integration',
    ],
    [t]
  );

  const {
    data: postsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['blog_posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, image_url, updated_at')
        .eq('published', true)
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (
        data?.map((post, index) => ({
          title: post.title,
          excerpt: post.excerpt || 'Read more about this topic...',
          image:
            post.image_url ||
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          author: 'Monynha Softwares Team',
          date: new Date(post.updated_at).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          readTime: '5 min read',
          category: 'AI Insights',
          featured: index === 0,
          slug: post.slug,
        })) || []
      );
    },
  });

  const posts = postsData || [];

  if (isLoading) {
    return (
      <Layout>
        <Meta
          title="Insights & Updates - Monynha Softwares Agency"
          description={t('blog.description')}
          ogTitle="Insights & Updates - Monynha Softwares Agency"
          ogDescription={t('blog.description')}
          ogImage="/placeholder.svg"
        />
        <div className="container mx-auto px-4 py-16 text-center">
          Loading...
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <Meta
          title="Insights & Updates - Monynha Softwares Agency"
          description={t('blog.description')}
          ogTitle="Insights & Updates - Monynha Softwares Agency"
          ogDescription={t('blog.description')}
          ogImage="/placeholder.svg"
        />
        <div className="container mx-auto px-4 py-16 text-center">
          Error loading posts
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Meta
        title="Insights & Updates - Monynha Softwares Agency"
        description={t('blog.description')}
        ogTitle="Insights & Updates - Monynha Softwares Agency"
        ogDescription={t('blog.description')}
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
              <BreadcrumbPage>{t('navigation.blog')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* Hero Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
              {t('blog.title')}
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              {t('blog.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={index === 0 ? 'default' : 'outline'}
                className={`rounded-full px-6 py-2 ${
                  index === 0
                    ? 'bg-gradient-brand text-white'
                    : 'border-neutral-200 text-neutral-600 hover:border-brand-blue hover:text-brand-blue'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {posts
        .filter((post) => post.featured)
        .map((post, index) => (
          <section key={index} className="pb-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="border-0 shadow-soft-lg rounded-2xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative">
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-80 lg:h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-brand text-white px-3 py-1 rounded-full text-sm font-medium">
                        {t('blog.featured')}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center space-x-4 text-sm text-neutral-500 mb-4">
                      <span className="bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full font-medium">
                        {post.category}
                      </span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-4">
                      {post.title}
                    </h2>
                    <p className="text-lg text-neutral-600 mb-6">
                      {post.excerpt}
                    </p>
                    <Button className="btn-primary w-fit">
                      {t('blog.read')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        ))}

      {/* Blog Grid */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts
              .filter((post) => !post.featured)
              .map((post, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-soft hover:shadow-soft-lg transition-all ease-in-out duration-300 card-hover rounded-2xl overflow-hidden bg-white"
                >
                  <div className="relative">
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-brand-blue px-3 py-1 rounded-full text-sm font-medium">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-neutral-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-neutral-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <Button
                      variant="ghost"
                      className="text-brand-blue hover:text-brand-purple p-0 h-auto font-semibold"
                    >
                      {t('blog.readMore')}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 bg-gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            {t('blog.newsletter.title')}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {t('blog.newsletter.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder={t('blog.newsletter.placeholder')}
              className="flex-1 px-4 py-3 rounded-xl border-0 text-neutral-900 placeholder-neutral-500 focus:ring-2 focus:ring-white focus:outline-none"
            />
            <Button className="bg-white text-brand-purple hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl transition-all ease-in-out duration-300">
              {t('blog.newsletter.subscribe')}
            </Button>
          </div>
        </div>
      </section>
      <NewsletterSection />
    </Layout>
  );
};

export default Blog;
