-- Create leads table for contact form submissions
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  project TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users table for additional user data
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(auth_id)
);

-- Create solutions table for products/services
CREATE TABLE public.solutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog_posts table for articles
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads (anyone can insert, only admins can view)
CREATE POLICY "Anyone can submit leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view leads" 
ON public.leads 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE auth_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for users (users can view their own data, admins can view all)
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth_id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (auth_id = auth.uid());

-- RLS Policies for solutions (public read, admin write)
CREATE POLICY "Anyone can view active solutions" 
ON public.solutions 
FOR SELECT 
USING (active = true);

CREATE POLICY "Only admins can manage solutions" 
ON public.solutions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE auth_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for blog_posts (public read published posts, admin manage all)
CREATE POLICY "Anyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (published = true);

CREATE POLICY "Only admins can manage blog posts" 
ON public.blog_posts 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE auth_id = auth.uid() AND role = 'admin'
));

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_solutions_updated_at
    BEFORE UPDATE ON public.solutions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample solutions data
INSERT INTO public.solutions (title, description, slug, features, active) VALUES
('Boteco Pro', 'Sistema completo de gerenciamento para bares e restaurantes com IA integrada para otimização de operações.', 'boteco-pro', 
'["Gestão de pedidos", "Controle de estoque", "Analytics de vendas", "IA para previsão de demanda", "Sistema de fidelidade"]'::jsonb, true),
('AssisTina', 'Assistente virtual personalizada com IA para automatizar atendimento ao cliente e processos internos.', 'assistina', 
'["Atendimento 24/7", "Integração com WhatsApp", "Machine Learning", "Análise de sentimento", "Dashboard de métricas"]'::jsonb, true);

-- Insert sample blog posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, published) VALUES
('Como a IA está transformando o setor de restaurantes', 'ia-transformando-restaurantes', 
'Descubra como a inteligência artificial está revolucionando a gestão de bares e restaurantes.', 
'A inteligência artificial está transformando diversos setores, e o ramo alimentício não fica para trás...', true),
('O futuro dos assistentes virtuais nas empresas', 'futuro-assistentes-virtuais', 
'Explore as tendências e inovações dos assistentes de IA no mundo corporativo.', 
'Os assistentes virtuais estão se tornando cada vez mais sofisticados...', true);