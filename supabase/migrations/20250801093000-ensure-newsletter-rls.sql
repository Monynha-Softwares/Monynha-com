-- Ensure RLS policies for newsletter subscribers allow public inserts
ALTER TABLE public.newsletter_subscribers
  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Only admins can view newsletter subscribers"
ON public.newsletter_subscribers
FOR SELECT
USING (public.is_admin(auth.uid()));
