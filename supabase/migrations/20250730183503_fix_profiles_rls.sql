-- Helper function to check if a user is admin
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = uid
      AND p.role = 'admin'
  );
END;
$$;

-- Replace policy that caused infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Update other admin policies to use the helper function
DROP POLICY IF EXISTS "Only admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Only admins can manage blog posts"
ON public.blog_posts
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can manage solutions" ON public.solutions;
CREATE POLICY "Only admins can manage solutions"
ON public.solutions
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can manage repositories" ON public.repositories;
CREATE POLICY "Only admins can manage repositories"
ON public.repositories
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can manage team members" ON public.team_members;
CREATE POLICY "Only admins can manage team members"
ON public.team_members
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can manage homepage features" ON public.homepage_features;
CREATE POLICY "Only admins can manage homepage features"
ON public.homepage_features
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can view leads" ON public.leads;
CREATE POLICY "Only admins can view leads"
ON public.leads
FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can view newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Only admins can view newsletter subscribers"
ON public.newsletter_subscribers
FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can manage site settings" ON public.site_settings;
CREATE POLICY "Only admins can manage site settings"
ON public.site_settings
FOR ALL
USING (public.is_admin(auth.uid()));
