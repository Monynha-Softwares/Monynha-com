-- Create repositories table for GitHub projects
CREATE TABLE public.repositories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  github_url TEXT NOT NULL,
  demo_url TEXT,
  tags TEXT[] DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;

-- Create policies for repositories
CREATE POLICY "Anyone can view active repositories" 
ON public.repositories 
FOR SELECT 
USING (active = true);

CREATE POLICY "Only admins can manage repositories" 
ON public.repositories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.auth_id = auth.uid() 
  AND users.role = 'admin'
));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_repositories_updated_at
BEFORE UPDATE ON public.repositories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.repositories (name, description, github_url, demo_url, tags) VALUES
('Boteco Pro', 'Gerenciador de pedidos e mesas com React + Firebase', 'https://github.com/marcelo-m7/BotecoPro-Apps', 'https://boteco-pro-demo.vercel.app', ARRAY['React', 'Firebase', 'TypeScript', 'Tailwind']),
('AssisTina', 'Assistente virtual com GPT e frontend customizado', 'https://github.com/Monynha-Softwares/assistina', 'https://assistina-demo.vercel.app', ARRAY['React', 'OpenAI', 'Node.js', 'Express']),
('Monynha Softwares Site', 'Site institucional open source em React + Supabase', 'https://github.com/Monynha Softwares/site-institucional', 'https://Monynha Softwares.com', ARRAY['React', 'Supabase', 'Vite', 'Tailwind']);