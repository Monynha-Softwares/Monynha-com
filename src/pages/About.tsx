import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';
import Meta from '@/components/Meta';
import { Brain, Target, Users, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

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

  const stats = useMemo(
    () => [
      { number: '50+', label: t('about.stats.projects') },
      { number: '100%', label: t('about.stats.satisfaction') },
      { number: '5+', label: t('about.stats.experience') },
      { number: '24/7', label: t('about.stats.support') },
    ],
    [t]
  );

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

      {/* Mission Section */}
      <section className="py-24 bg-gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-8">
            {t('about.missionTitle')}
          </h2>
          <p className="text-xl text-blue-100 leading-relaxed">
            {t('about.mission')}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-6">
                {t('about.storyTitle')}
              </h2>
              <div className="space-y-6 text-lg text-neutral-600">
                <p>{t('about.story.p1')}</p>
                <p>{t('about.story.p2')}</p>
                <p>{t('about.story.p3')}</p>
              </div>
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

      {/* Values Section */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              {t('about.valuesTitle')}
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              {t('about.valuesDescription')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="border-0 shadow-soft hover:shadow-soft-lg transition-all ease-in-out duration-300 card-hover rounded-2xl"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-neutral-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-brand mb-2">
                  {stat.number}
                </div>
                <div className="text-neutral-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
