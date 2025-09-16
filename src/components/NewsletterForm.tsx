import { FormEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase';
import { cn } from '@/lib/utils';

type SubmissionStatus = 'idle' | 'success' | 'error';

type NewsletterFormMessages = {
  success: string;
  invalid: string;
  duplicate: string;
  error: string;
};

const DEFAULT_MESSAGES: NewsletterFormMessages = {
  success: 'You are now subscribed to the newsletter!',
  invalid: 'Please enter a valid email address.',
  duplicate: 'This email is already subscribed to the newsletter.',
  error: 'We could not process your subscription. Please try again later.',
};

interface NewsletterFormProps {
  placeholder?: string;
  buttonLabel?: string;
  loadingLabel?: string;
  messages?: Partial<NewsletterFormMessages>;
  wrapperClassName?: string;
  formClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  messageClassName?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NewsletterForm = ({
  placeholder,
  buttonLabel = 'Subscribe',
  loadingLabel = 'Subscribing...',
  messages,
  wrapperClassName,
  formClassName,
  inputClassName,
  buttonClassName,
  messageClassName,
}: NewsletterFormProps) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mergedMessages = { ...DEFAULT_MESSAGES, ...messages } satisfies NewsletterFormMessages;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setStatus('error');
      setFeedback(mergedMessages.invalid);
      return;
    }

    setIsSubmitting(true);
    setFeedback('');
    setStatus('idle');

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: trimmedEmail }]);

      if (error) {
        if (error.code === '23505') {
          setStatus('error');
          setFeedback(mergedMessages.duplicate);
          return;
        }

        console.error('Newsletter subscription error:', error);
        setStatus('error');
        setFeedback(mergedMessages.error);
        return;
      }

      setEmail('');
      setStatus('success');
      setFeedback(mergedMessages.success);
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setStatus('error');
      setFeedback(mergedMessages.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showFeedback = status !== 'idle' && feedback;

  return (
    <div className={cn('w-full', wrapperClassName)}>
      <form
        onSubmit={handleSubmit}
        className={cn('flex flex-col sm:flex-row gap-4', formClassName)}
      >
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={placeholder}
          className={cn('flex-1 h-12 rounded-xl', inputClassName)}
          autoComplete="email"
          disabled={isSubmitting}
          required
        />
        <Button
          type="submit"
          className={cn('rounded-xl px-6 py-3 font-semibold', buttonClassName)}
          disabled={isSubmitting}
        >
          {isSubmitting ? loadingLabel : buttonLabel}
        </Button>
      </form>

      {showFeedback && (
        <Alert
          variant={status === 'success' ? 'default' : 'destructive'}
          className={cn('mt-4', messageClassName)}
        >
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default NewsletterForm;
