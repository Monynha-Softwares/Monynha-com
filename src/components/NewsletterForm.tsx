import { useState } from 'react';
import { supabase } from '@/integrations/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Message = {
  title: string;
  description?: string;
};

type NewsletterFormMessages = {
  success?: Message;
  invalidEmail?: Message;
  duplicateEmail?: Message;
  error?: Message;
};

type NewsletterFormLabels = {
  submit?: string;
  submitting?: string;
};

interface NewsletterFormProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  labels?: NewsletterFormLabels;
  messages?: NewsletterFormMessages;
  onSuccess?: (email: string) => void;
}

const DEFAULT_LABELS: Required<NewsletterFormLabels> = {
  submit: 'Subscribe',
  submitting: 'Subscribing...',
};

const DEFAULT_MESSAGES: Required<NewsletterFormMessages> = {
  success: {
    title: 'Subscription confirmed!',
    description: 'You will start receiving our latest updates soon.',
  },
  invalidEmail: {
    title: 'Invalid email',
    description: 'Please enter a valid email address before subscribing.',
  },
  duplicateEmail: {
    title: 'Already subscribed',
    description: 'This email is already on our newsletter list.',
  },
  error: {
    title: 'Something went wrong',
    description: 'We could not complete your subscription. Please try again.',
  },
};

const NewsletterForm = ({
  placeholder = 'your@email.com',
  className,
  inputClassName,
  buttonClassName,
  labels,
  messages,
  onSuccess,
}: NewsletterFormProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { submit, submitting } = { ...DEFAULT_LABELS, ...labels };
  const {
    success,
    invalidEmail,
    duplicateEmail,
    error,
  } = { ...DEFAULT_MESSAGES, ...messages };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      toast({
        ...invalidEmail,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: trimmedEmail }]);

      if (insertError) {
        const normalizedMessage = insertError.message?.toLowerCase() ?? '';
        const duplicateViolation =
          insertError.code === '23505' ||
          insertError.code === '409' ||
          normalizedMessage.includes('duplicate');

        if (duplicateViolation) {
          toast({
            ...duplicateEmail,
            variant: 'destructive',
          });
        } else {
          toast({
            ...error,
            variant: 'destructive',
          });
        }
        return;
      }

      toast(success);
      setEmail('');
      onSuccess?.(trimmedEmail);
    } catch (submitError) {
      console.error('Newsletter subscription error:', submitError);
      toast({
        ...error,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col sm:flex-row gap-4', className)}>
      <Input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={placeholder}
        autoComplete="email"
        disabled={isSubmitting}
        className={cn('flex-1', inputClassName)}
        required
      />
      <Button
        type="submit"
        disabled={isSubmitting}
        className={buttonClassName}
      >
        {isSubmitting ? submitting : submit}
      </Button>
    </form>
  );
};

export default NewsletterForm;
