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
      <section className="relative py-24 text-white">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-purple via-brand-blue to-brand-pink" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-[2.6rem] border border-white/25 bg-white/10 p-[1px] shadow-[0_25px_65px_-20px_rgba(15,23,42,0.55)] backdrop-blur-2xl">
            <div className="rounded-[2.5rem] bg-white/10 px-10 py-16 backdrop-blur-xl">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold">
                {t('newsletterSection.thankYouTitle')}
              </h2>
              <p className="mt-4 text-xl text-blue-100">
                {t('newsletterSection.thankYouDescription')}
              </p>
              <Button
                onClick={() => {
                  setIsSubscribed(false);
                  setEmail('');
                }}
                className="btn-secondary mt-8 inline-flex items-center gap-2 rounded-full border-white/40 bg-white/90 px-8 py-3 text-base font-semibold text-brand-purple hover:border-white/60 hover:text-brand-purple"
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
    <section className="relative py-24 text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-purple via-brand-blue to-brand-pink" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_60%)]" />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Card className="rounded-[2.4rem] border-white/25 bg-white/10 p-[1px] shadow-[0_25px_65px_-20px_rgba(15,23,42,0.55)] backdrop-blur-2xl">
          <CardContent className="rounded-[2.3rem] bg-white/10 p-10 text-center backdrop-blur-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <Mail className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              {t('newsletterSection.title')}
            </h2>

            <p className="mt-4 text-xl text-blue-100">
              {t('newsletterSection.description')}
            </p>

            <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-md">
              <div className="flex flex-col gap-4 sm:flex-row">
                <Input
                  type="email"
                  placeholder={t('newsletterSection.placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-xl border-white/30 bg-white/20 text-white placeholder:text-white/70 focus:border-white focus:ring-white"
                  required
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="whitespace-nowrap rounded-xl bg-white/90 px-8 py-3 font-semibold text-brand-purple shadow-[0_18px_45px_-24px_rgba(15,23,42,0.8)] transition-colors hover:bg-white focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  {isSubmitting
                    ? t('newsletterSection.subscribing')
                    : t('newsletterSection.subscribe')}
                </Button>
              </div>
            </form>

            <p className="mt-4 text-sm text-blue-200">
              {t('newsletterSection.privacy')}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default NewsletterSection;
