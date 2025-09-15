
-- Criar tabela profiles para usuários
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Função para criar profile automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar profile automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atualizar políticas RLS existentes para usar a nova estrutura de profiles
DROP POLICY IF EXISTS "Only admins can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Only admins can manage solutions" ON public.solutions;
DROP POLICY IF EXISTS "Only admins can manage repositories" ON public.repositories;
DROP POLICY IF EXISTS "Only admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Only admins can manage homepage features" ON public.homepage_features;
DROP POLICY IF EXISTS "Only admins can view leads" ON public.leads;
DROP POLICY IF EXISTS "Only admins can view newsletter subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Only admins can manage blog posts" 
ON public.blog_posts 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Only admins can manage solutions" 
ON public.solutions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Only admins can manage repositories" 
ON public.repositories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Only admins can manage team members" 
ON public.team_members 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Only admins can manage homepage features" 
ON public.homepage_features 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Only admins can view leads" 
ON public.leads 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Only admins can view newsletter subscribers" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Remover a tabela users antiga se ela existir (ela conflita com a nova estrutura)
DROP TABLE IF EXISTS public.users CASCADE;

-- Adicionar trigger para atualizar updated_at em profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Completar dados dos blog posts existentes
UPDATE public.blog_posts SET 
  image_url = 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  excerpt = 'Descubra como a inteligência artificial está revolucionando a gestão de bares e restaurantes com otimização de operações.'
WHERE slug = 'ia-transformando-restaurantes';

UPDATE public.blog_posts SET 
  image_url = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  excerpt = 'Explore as tendências e inovações dos assistentes de IA no mundo corporativo e seu impacto nos negócios.'
WHERE slug = 'futuro-assistentes-virtuais';

-- Adicionar mais posts de blog com conteúdo completo
INSERT INTO public.blog_posts (title, slug, excerpt, content, image_url, published) VALUES
('5 Estratégias para Implementar IA em Pequenos Negócios', 'estrategias-ia-pequenos-negocios', 
'Guia prático com 5 estratégias testadas para implementar inteligência artificial em pequenos e médios negócios.', 
'A implementação de IA em pequenos negócios não precisa ser complexa ou cara. Neste artigo, apresentamos 5 estratégias práticas que podem transformar seu negócio...', 
'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
true),

('Automação de Atendimento: ROI em 6 Meses', 'automacao-atendimento-roi', 
'Case study detalhado mostrando como uma empresa conseguiu ROI de 300% em 6 meses com automação de atendimento.', 
'Este case study apresenta os resultados reais de uma implementação de automação de atendimento que gerou retorno significativo em apenas 6 meses...', 
'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
true),

('Integração de IA com Sistemas Legacy', 'integracao-ia-sistemas-legacy', 
'Como integrar soluções modernas de IA com sistemas antigos sem interromper as operações do seu negócio.', 
'A integração de IA com sistemas legacy é um dos maiores desafios técnicos enfrentados pelas empresas hoje. Neste guia, mostramos como fazer essa transição...', 
'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
true);

-- Criar tabela para configurações do site
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para site_settings
CREATE POLICY "Anyone can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Trigger para updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configurações do site
INSERT INTO public.site_settings (key, value, description) VALUES
('contact_info', 
'{"email": "hello@monynha.com", "phone": "+41 77 968 88 72", "address": "Faro, Portugal", "linkedin": "https://linkedin.com/company/Monynha-Softwares"}', 
'Informações de contato da empresa'),

-- ('about_stats', 
-- '[{"number": "50+", "label": "Projetos Concluídos"}, {"number": "100%", "label": "Satisfação do Cliente"}, {"number": "5+", "label": "Anos de Experiência"}, {"number": "24/7", "label": "Suporte Técnico"}]', 
-- 'Estatísticas exibidas na página About'),

('project_types', 
'["Custom AI Assistant", "Restaurant Management System", "Business Automation", "Legacy System Integration", "Consulting Services", "Other"]', 
'Tipos de projeto disponíveis no formulário de contato');
