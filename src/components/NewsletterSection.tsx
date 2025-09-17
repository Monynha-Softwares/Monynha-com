import { useState } from 'react';
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
      <section className="relative py-24">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-blue/15 via-transparent to-transparent"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[3rem] bg-gradient-hero p-[1px] shadow-soft-lg">
            <div className="rounded-[2.9rem] bg-white/10 px-6 py-16 text-center text-white backdrop-blur-sm sm:px-12 lg:px-16">
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold lg:text-4xl">
                {t('newsletterSection.thankYouTitle')}
              </h2>
              <p className="mt-4 text-lg text-white/80">
                {t('newsletterSection.thankYouDescription')}
              </p>
              <Button
                onClick={() => {
                  setIsSubscribed(false);
                  setEmail('');
                }}
                className="btn-secondary mt-10 inline-flex px-10 py-4 text-base"
              >
                {t('newsletterSection.subscribeAnother')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-blue/15 via-transparent to-transparent"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[3rem] bg-gradient-hero p-[1px] shadow-soft-lg">
          <div className="rounded-[2.9rem] bg-white/10 px-6 py-16 text-center text-white backdrop-blur-sm sm:px-12 lg:px-16">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
              <Mail className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold lg:text-4xl">
              {t('newsletterSection.title')}
            </h2>
            <p className="mt-4 text-lg text-white/80">
              {t('newsletterSection.description')}
            </p>
            <form onSubmit={handleSubmit} className="mx-auto mt-10 flex w-full max-w-xl flex-col gap-4 sm:flex-row">
              <Input
                type="email"
                placeholder={t('newsletterSection.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-2xl border-white/30 bg-white/15 text-white placeholder:text-white/70 focus:border-white focus:ring-white"
                required
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-white/90 px-10 py-3 text-base font-semibold text-brand-purple shadow-soft transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-white"
              >
                {isSubmitting
                  ? t('newsletterSection.subscribing')
                  : t('newsletterSection.subscribe')}
              </Button>
            </form>
            <p className="mt-6 text-sm text-white/70">
              {t('newsletterSection.privacy')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
