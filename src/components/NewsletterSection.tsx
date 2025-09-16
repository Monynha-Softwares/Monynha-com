import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NewsletterForm from '@/components/NewsletterForm';
import { Mail, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NewsletterSection = () => {
  const { t } = useTranslation();
  const [isSubscribed, setIsSubscribed] = useState(false);

  if (isSubscribed) {
    return (
      <section className="py-24 bg-gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {t('newsletterSection.thankYouTitle')}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {t('newsletterSection.thankYouDescription')}
          </p>
          <Button
            onClick={() => {
              setIsSubscribed(false);
            }}
            className="bg-white text-brand-purple hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl"
          >
            {t('newsletterSection.subscribeAnother')}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-hero text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-0 shadow-soft-lg rounded-2xl bg-white/10 backdrop-blur-sm">
          <CardContent className="p-8 lg:p-12 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              {t('newsletterSection.title')}
            </h2>

            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t('newsletterSection.description')}
            </p>

            <NewsletterForm
              className="max-w-md mx-auto"
              inputClassName="rounded-xl border-white/30 bg-white/20 text-white placeholder:text-white/70 focus:border-white focus:ring-white"
              buttonClassName="bg-white text-brand-purple hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl whitespace-nowrap"
              placeholder={t('newsletterSection.placeholder')}
              labels={{
                submit: t('newsletterSection.subscribe'),
                submitting: t('newsletterSection.subscribing'),
              }}
              messages={{
                success: {
                  title: t('newsletterSection.successTitle'),
                  description: t('newsletterSection.successDescription'),
                },
                invalidEmail: {
                  title: t('newsletterSection.invalidEmailTitle'),
                  description: t('newsletterSection.invalidEmailDescription'),
                },
                duplicateEmail: {
                  title: t('newsletterSection.alreadySubscribedTitle'),
                  description: t('newsletterSection.alreadySubscribedDescription'),
                },
                error: {
                  title: t('newsletterSection.errorTitle'),
                  description: t('newsletterSection.errorDescription'),
                },
              }}
              onSuccess={() => setIsSubscribed(true)}
            />

            <p className="text-sm text-blue-200 mt-4">
              {t('newsletterSection.privacy')}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default NewsletterSection;
