import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import Meta from '@/components/Meta';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  ArrowRight,
  BarChart3,
  Users,
  Zap,
  Shield,
  Brain,
  MessageSquare,
  Calendar,
  Settings,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

const fallbackSolutions = [
  {
    name: 'Boteco Pro',
    tagline: 'Restaurant & Bar Management System',
    description:
      'Complete management solution for restaurants and bars with AI-powered analytics, inventory management, and customer insights.',
    image:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    features: [
      {
        icon: BarChart3,
        title: 'Real-time Analytics',
        description:
          'Track sales, inventory, and customer behavior in real-time',
      },
      {
        icon: Users,
        title: 'Staff Management',
        description: 'Efficient scheduling and performance tracking',
      },
      {
        icon: Zap,
        title: 'Quick Order Processing',
        description: 'Streamlined POS system with mobile integration',
      },
      {
        icon: Shield,
        title: 'Secure Payments',
        description: 'Multiple payment methods with fraud protection',
      },
    ],
    gradient: 'from-brand-purple to-brand-blue',
    color: 'brand-purple',
  },
  {
    name: 'AssisTina AI',
    tagline: 'Personalized AI Assistant',
    description:
      'Intelligent AI assistant that learns your business processes and automates routine tasks, increasing efficiency and productivity.',
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    features: [
      {
        icon: Brain,
        title: 'Machine Learning',
        description: 'Continuously learns and adapts to your workflow',
      },
      {
        icon: MessageSquare,
        title: 'Natural Language',
        description: 'Communicate naturally with voice and text',
      },
      {
        icon: Calendar,
        title: 'Task Automation',
        description: 'Automate scheduling, reminders, and follow-ups',
      },
      {
        icon: Settings,
        title: 'Custom Integration',
        description: 'Seamlessly integrates with your existing tools',
      },
    ],
    gradient: 'from-brand-pink to-brand-orange',
    color: 'brand-pink',
  },
];

const Solutions = () => {
  const { t } = useTranslation();

  const {
    data: solutions = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['solutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      return (
        data?.map((solution, index) => {
          const getFeatures = (slug: string) => {
            if (slug === 'boteco-pro') {
              return [
                {
                  icon: BarChart3,
                  title: 'Real-time Analytics',
                  description:
                    'Track sales, inventory, and customer behavior in real-time',
                },
                {
                  icon: Users,
                  title: 'Staff Management',
                  description: 'Efficient scheduling and performance tracking',
                },
                {
                  icon: Zap,
                  title: 'Quick Order Processing',
                  description: 'Streamlined POS system with mobile integration',
                },
                {
                  icon: Shield,
                  title: 'Secure Payments',
                  description: 'Multiple payment methods with fraud protection',
                },
              ];
            } else {
              return [
                {
                  icon: Brain,
                  title: 'Machine Learning',
                  description:
                    'Continuously learns and adapts to your workflow',
                },
                {
                  icon: MessageSquare,
                  title: 'Natural Language',
                  description: 'Communicate naturally with voice and text',
                },
                {
                  icon: Calendar,
                  title: 'Task Automation',
                  description: 'Automate scheduling, reminders, and follow-ups',
                },
                {
                  icon: Settings,
                  title: 'Custom Integration',
                  description: 'Seamlessly integrates with your existing tools',
                },
              ];
            }
          };

          return {
            name: solution.title,
            tagline:
              solution.slug === 'boteco-pro'
                ? 'Restaurant & Bar Management System'
                : 'Personalized AI Assistant',
            description: solution.description,
            slug: solution.slug,
            image:
              solution.image_url ||
              (solution.slug === 'boteco-pro'
                ? 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
                : 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
            features: getFeatures(solution.slug),
            gradient:
              solution.slug === 'boteco-pro'
                ? 'from-brand-purple to-brand-blue'
                : 'from-brand-pink to-brand-orange',
            color:
              solution.slug === 'boteco-pro' ? 'brand-purple' : 'brand-pink',
          };
        }) || []
      );
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <Meta
          title="Our Software Solutions - Monynha Softwares Agency"
          description={t('solutionsPage.description')}
          ogTitle="Our Software Solutions - Monynha Softwares Agency"
          ogDescription={t('solutionsPage.description')}
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
          title="Our Software Solutions - Monynha Softwares Agency"
          description={t('solutionsPage.description')}
          ogTitle="Our Software Solutions - Monynha Softwares Agency"
          ogDescription={t('solutionsPage.description')}
          ogImage="/placeholder.svg"
        />
        <div className="container mx-auto px-4 py-16 text-center">
          Error loading solutions
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Meta
        title="Our Software Solutions - Monynha Softwares Agency"
        description={t('solutionsPage.description')}
        ogTitle="Our Software Solutions - Monynha Softwares Agency"
        ogDescription={t('solutionsPage.description')}
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
              <BreadcrumbPage>{t('navigation.solutions')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* Hero Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
              {t('solutionsPage.title')}
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              {t('solutionsPage.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Detail */}
      {(solutions.length > 0 ? solutions : fallbackSolutions).map(
        (solution, index) => (
          <section
            key={index}
            className={`py-24 ${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div
                className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div
                    className={`h-2 w-24 bg-gradient-to-r ${solution.gradient} rounded-full mb-6`}
                  ></div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                    {solution.name}
                  </h2>
                  <p className="text-lg text-neutral-600 mb-2 font-medium">
                    {solution.tagline}
                  </p>
                  <p className="text-lg text-neutral-600 mb-8">
                    {solution.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    {solution.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-start space-x-3"
                      >
                        <div
                          className={`w-10 h-10 bg-gradient-to-r ${solution.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}
                        >
                          <feature.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900 mb-1">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-neutral-600">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link to="/contact">
                    <Button className={`btn-primary`}>
                      {t('solutionsPage.requestDemo')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <Card className="border-0 shadow-soft-lg rounded-2xl overflow-hidden">
                    <img
                      src={solution.image}
                      alt={solution.name}
                      loading="lazy"
                      className="w-full h-80 object-cover"
                    />
                    <div
                      className={`h-2 bg-gradient-to-r ${solution.gradient}`}
                    ></div>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        )
      )}

      {/* Custom Solutions CTA */}
      <section className="py-24 bg-gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            {t('solutionsPage.customTitle')}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {t('solutionsPage.customDescription')}
          </p>
          <Link to="/contact">
            <Button
              size="lg"
              className="bg-white text-brand-purple hover:bg-blue-50 font-semibold px-8 py-4 rounded-xl text-lg transition-all ease-in-out duration-300"
            >
              {t('solutionsPage.discuss')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Solutions;
