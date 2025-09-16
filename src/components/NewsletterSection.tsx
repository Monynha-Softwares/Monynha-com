import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CSSProperties } from 'react';

const NewsletterSection = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const surfaceStyles = useMemo(
    () =>
      ({
        '--surface-bg':
          'linear-gradient(135deg, rgba(124,58,237,0.5) 0%, rgba(14,165,233,0.28) 45%, rgba(236,72,153,0.45) 100%)',
        '--surface-overlay':
          'radial-gradient(circle at 20% 20%, rgba(236,72,153,0.42), transparent 55%), linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.1) 100%)',
        '--surface-blur': '26px',
      }) satisfies CSSProperties,
    []
  );

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
      <section className="surface-section py-24 text-white" style={surfaceStyles}>
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
              setEmail('');
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
    <section className="surface-section py-24 text-white" style={surfaceStyles}>
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

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
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
                  className="bg-white text-brand-purple hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl whitespace-nowrap"
                >
                  {isSubmitting
                    ? t('newsletterSection.subscribing')
                    : t('newsletterSection.subscribe')}
                </Button>
              </div>
            </form>

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
