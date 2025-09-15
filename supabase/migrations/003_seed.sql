-- SEED: Popula o banco com dados de exemplo para desenvolvimento

-- blog_posts
INSERT INTO public.blog_posts (id, title, slug, excerpt, content, image_url, published, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Primeiro Post', 'primeiro-post', 'Resumo do primeiro post', 'Conteúdo completo do primeiro post.', NULL, true, now(), now()),
  (gen_random_uuid(), 'Segundo Post', 'segundo-post', 'Resumo do segundo post', 'Conteúdo completo do segundo post.', NULL, false, now(), now());

-- homepage_features
INSERT INTO public.homepage_features (id, title, description, icon, url, order_index, active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Agilidade', 'Entrega rápida e eficiente.', 'zap', '/#agilidade', 1, true, now(), now()),
  (gen_random_uuid(), 'Inovação', 'Soluções modernas e criativas.', 'sparkles', '/#inovacao', 2, true, now(), now());

-- leads
INSERT INTO public.leads (id, name, email, message, company, project, created_at)
VALUES
  (gen_random_uuid(), 'João Silva', 'joao@email.com', 'Gostaria de um orçamento.', 'Empresa X', 'Custom AI Assistant', now());

-- newsletter_subscribers
INSERT INTO public.newsletter_subscribers (id, email, active, subscribed_at)
VALUES
  (gen_random_uuid(), 'assinante@email.com', true, now());

-- profiles
INSERT INTO public.profiles (id, user_id, name, email, avatar_url, role, created_at, updated_at)
VALUES
  (gen_random_uuid(), gen_random_uuid(), 'Admin User', 'admin@monynha.com', NULL, 'admin', now(), now()),
  (gen_random_uuid(), gen_random_uuid(), 'Usuário Comum', 'user@monynha.com', NULL, 'user', now(), now());

-- repositories
INSERT INTO public.repositories (id, name, description, github_url, demo_url, tags, active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'monynha-com', 'Site institucional', 'https://github.com/Monynha-Softwares/monynha-com', NULL, ARRAY['site','institucional'], true, now(), now());

-- site_settings
INSERT INTO public.site_settings (id, key, value, description, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'site_metadata', '{"title": "Monynha Softwares", "description": "Software Development and Technology Solutions"}', 'Metadados do site', now(), now());

-- solutions
INSERT INTO public.solutions (id, title, slug, description, features, image_url, active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Gestão de Restaurantes', 'gestao-restaurantes', 'Sistema completo para restaurantes.', '["Pedidos online", "Controle de estoque"]', NULL, true, now(), now());

-- team_members
INSERT INTO public.team_members (id, name, role, bio, image_url, linkedin_url, active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Marcelo Santos', 'CEO', 'Fundador da Monynha Softwares.', NULL, NULL, true, now(), now());
