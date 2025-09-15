-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  linkedin_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active team members" 
ON public.team_members 
FOR SELECT 
USING (active = true);

CREATE POLICY "Only admins can manage team members" 
ON public.team_members 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.auth_id = auth.uid() 
  AND users.role = 'admin'
));

-- Create newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view newsletter subscribers" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.auth_id = auth.uid() 
  AND users.role = 'admin'
));

-- Add sample team members data
INSERT INTO public.team_members (name, role, bio, image_url, linkedin_url) VALUES
('Marcelo Santos', 'CEO & Founder', 'Tech innovator specializing in scalable architectures. Engeneer studant with expertise in machine learning and cloud solutions. Expert in transforming traditional businesses with cutting-edge technology.', null, 'https://linkedin.com/in/MarceloSantos'),
('Sofia Santos', 'Head of Design', 'Creative director passionate about user-centered design. Artist and disigner, specializes in creating intuitive interfaces for complex AI-powered systems.', null, 'https://linkedin.com/in/anarodriguez'),
('Codex Agent', 'Senior Developer', 'Full-stack developer with focus on React, Node.js, and AI integration. Formed by OpenAI, a leading AI company. Expert in building robust and scalable web applications.', null, 'https://linkedin.com/in/pedrolima');

-- Create homepage_features table for dynamic content
CREATE TABLE public.homepage_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_features ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active homepage features" 
ON public.homepage_features 
FOR SELECT 
USING (active = true);

CREATE POLICY "Only admins can manage homepage features" 
ON public.homepage_features 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.auth_id = auth.uid() 
  AND users.role = 'admin'
));

-- Add sample homepage features
INSERT INTO public.homepage_features (title, description, icon, order_index) VALUES
('AI-Powered Solutions', 'Advanced artificial intelligence that learns and adapts to your business needs, providing intelligent automation and insights.', 'Brain', 1),
('Lightning Fast', 'Optimized performance and rapid deployment ensure your solutions are running at maximum efficiency from day one.', 'Zap', 2),
('Enterprise Security', 'Bank-level security protocols and compliance standards to protect your data and maintain customer trust.', 'Shield', 3),
('24/7 Support', 'Dedicated support team available around the clock to ensure your systems run smoothly and efficiently.', 'Users', 4);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_homepage_features_updated_at
BEFORE UPDATE ON public.homepage_features
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();