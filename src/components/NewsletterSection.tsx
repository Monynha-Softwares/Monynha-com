import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NewsletterSection = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic email validation
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: t('newsletterSection.invalidEmailTitle'),
        description: t('newsletterSection.invalidEmailDescription'),
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: email.trim() }]);

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation
          toast({
            title: t('newsletterSection.alreadySubscribedTitle'),
            description: t('newsletterSection.alreadySubscribedDescription'),
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('newsletterSection.errorTitle'),
            description: t('newsletterSection.errorDescription'),
            variant: 'destructive',
          });
        }
        setIsSubmitting(false);
        return;
      }

      setIsSubscribed(true);
      toast({
        title: t('newsletterSection.successTitle'),
        description: t('newsletterSection.successDescription'),
      });
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: t('newsletterSection.errorTitle'),
        description: t('newsletterSection.errorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <section className="relative overflow-hidden py-24 text-white">
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="absolute inset-0 -z-10 bg-black/20" />
        <div className="absolute -top-16 left-1/3 -z-10 h-44 w-44 rounded-full bg-brand-blue/40 blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 -z-10 h-48 w-48 rounded-full bg-brand-orange/40 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/10">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white lg:text-4xl">
            {t('newsletterSection.thankYouTitle')}
          </h2>
          <p className="mt-4 text-lg text-white/85 sm:text-xl">
            {t('newsletterSection.thankYouDescription')}
          </p>
          <Button
            onClick={() => {
              setIsSubscribed(false);
              setEmail('');
            }}
            className="btn-secondary mt-10 px-8 py-3 text-base font-semibold text-brand-purple shadow-none hover:text-brand-blue"
          >
            {t('newsletterSection.subscribeAnother')}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden py-24 text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-hero" />
      <div className="absolute inset-0 -z-10 bg-black/25" />
      <div className="absolute -top-16 left-1/3 -z-10 h-44 w-44 rounded-full bg-brand-blue/40 blur-3xl" />
      <div className="absolute -bottom-20 right-1/4 -z-10 h-48 w-48 rounded-full bg-brand-orange/40 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Card className="rounded-[2rem] border border-white/30 bg-white/10 shadow-soft-lg backdrop-blur-md">
          <CardContent className="p-8 text-center lg:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white/10">
              <Mail className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-white lg:text-4xl">
              {t('newsletterSection.title')}
            </h2>

            <p className="mt-4 text-lg text-white/85 sm:text-xl">
              {t('newsletterSection.description')}
            </p>

            <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-md">
              <div className="flex flex-col gap-4 sm:flex-row">
                <Input
                  type="email"
                  placeholder={t('newsletterSection.placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-2xl border border-white/40 bg-white/15 text-white placeholder:text-white/70 focus:border-white focus:ring-white"
                  required
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-secondary whitespace-nowrap px-8 py-3 text-base font-semibold text-brand-purple shadow-none hover:text-brand-blue"
                >
                  {isSubmitting
                    ? t('newsletterSection.subscribing')
                    : t('newsletterSection.subscribe')}
                </Button>
              </div>
            </form>

            <p className="mt-4 text-sm text-blue-100">
              {t('newsletterSection.privacy')}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default NewsletterSection;
