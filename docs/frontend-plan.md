# Plano Técnico para Finalização do Frontend do Monynha.com

## Visão Geral
Este documento descreve o plano técnico para concluir o frontend do site Monynha.com, cobrindo integrações pendentes, implementação de páginas e componentes e atividades de garantia de qualidade. As iniciativas estão organizadas por temas funcionais e distribuídas em sprints semanais para facilitar o acompanhamento da equipe.

## Backlog Funcional

### Autenticação e Dashboard
- Implementar fluxo completo de login, registro e logout utilizando Supabase Auth (incluindo login por e-mail/senha ou magic link).
- Criar rota protegida `/dashboard` que apresente informações do perfil do usuário autenticado e, para administradores, métricas como leads e inscrições de newsletter.
- Gerenciar estado de sessão via cookies/tokens, proteger rotas com middleware e adaptar a navegação para estados autenticado/não autenticado.

### Integração Supabase e RLS
- Consumir dados do Supabase em SSR/CSR para tabelas `solutions`, `repositories`, `blog_posts`, `team_members`, `site_settings`, `leads`, entre outras.
- Garantir conformidade com políticas RLS: visitantes podem inserir leads e inscrições; somente administradores visualizam dados restritos.
- Utilizar service role apenas em operações administrativas server-side e validar comportamento das políticas com testes direcionados.

### Seções de Soluções e Projetos Open Source
- Completar exibição dos cartões de solução na home e criar páginas dedicadas `/solutions` e, opcionalmente, `/solutions/[slug]` com detalhes.
- Desenvolver página `/projects` (ou `/open-source`) listando repositórios da organização, com links, descrições e metadados relevantes.
- Integrar sincronização com API do GitHub (função backend existente) para manter os dados atualizados.

### Páginas Públicas “Sobre” e Equipe
- Construir `/about` apresentando missão, valores, histórico, métricas e dados de equipe via tabela `team_members`.
- Garantir aderência à identidade da marca, com uso da paleta oficial, tipografia Quicksand/Inter e elementos visuais inclusivos.

### Blog e Comentários
- Implementar listagem de posts em `/blog` com paginação ou scroll infinito.
- Criar rota dinâmica `/blog/[slug]` para exibir conteúdo completo, imagem destacada e metadados.
- Desenvolver sistema de comentários: tabela `comments` no Supabase com RLS (inserção apenas autenticados, leitura pública, moderação por autor/admin), formulário autenticado e exibição em ordem cronológica.

### Formulário de Contato e Newsletter
- Finalizar `/contact` com formulário validado (nome, e-mail, empresa, tipo de projeto dinâmico, mensagem) que insere dados na tabela `leads`.
- Exibir feedback de sucesso/erro e dados de contato institucionais provenientes de `site_settings.contact_info`.
- Implementar inscrição de newsletter (ex.: no rodapé) salvando e-mails em `newsletter_subscribers`, com validação e mensagens adequadas.

### Navegação e Mega Menu
- Aprimorar `<SiteHeader />` com mega menu responsivo utilizando Radix Navigation Menu.
- Incluir links para Home, Soluções, Projetos, Sobre, Blog, Contato e CTAs relevantes.
- Garantir acessibilidade (navegação por teclado, `aria-*`, focus states) e comportamento consistente em mobile (menu hambúrguer/accordion).

### Identidade Visual e Experiência
- Aplicar tokens de design (cores, gradientes, bordas arredondadas) e componentes do design system (shadcn/ui) de forma unificada.
- Usar animações sutis (Framer Motion, Lenis) respeitando `prefers-reduced-motion`.
- Assegurar suporte multilíngue (pt, en, fr, es) via `next-intl`, adicionando traduções pendentes.
- Verificar modo escuro e performance (otimização de imagens, code-splitting, prefetch).

## Roadmap por Sprint

### Sprint 1 — Fundamentos e Integração Supabase
- Estruturar monorepo (Turborepo/Nx) com pacotes compartilhados (`@monynha/ui`, `@monynha/supabase`).
- Revisar configuração do design system e layout global (header/footer responsivos).
- Configurar clientes Supabase (SSR/CSR) e validar RLS com casos de teste.
- Garantir migrações/seed aplicados e páginas básicas renderizando sem erros.

### Sprint 2 — Autenticação e Dashboard
- Implementar páginas de login/registro e recuperação de senha.
- Proteger rotas autenticadas (middleware) e criar dashboard diferenciado por papel.
- Permitir edição de perfil (tabela `profiles`) e visualização de dados restritos por administradores.
- Adicionar logout, tratamento de erros e mensagens de feedback.

### Sprint 3 — Soluções, Projetos e Mega Menu
- Construir `/solutions` e (opcionalmente) `/solutions/[slug]` consumindo dados reais.
- Criar `/projects` com listagem de repositórios e integração com GitHub.
- Implementar mega menu no header, inclusive comportamento mobile e acessibilidade.
- Atualizar footer e metadados (SEO) dessas páginas.

### Sprint 4 — Sobre, Equipe e Contato
- Desenvolver `/about` com narrativa institucional, métricas e equipe dinâmica.
- Integrar formulário de contato com dados de `site_settings` e tipos de projeto dinâmicos.
- Garantir traduções completas, feedbacks de envio e página de agradecimento.
- Ajustar SEO (metadados/OG) para páginas institucionais.

### Sprint 5 — Blog e Comentários
- Implementar listagem paginada de posts (`/blog`).
- Construir rota `/blog/[slug]` com renderização do conteúdo e SEO por post.
- Adicionar módulo de comentários com Supabase (CRUD conforme permissões) e UI responsiva.
- Incluir features opcionais: posts relacionados, tempo de leitura, compartilhamento.

### Sprint 6 — QA, Acessibilidade e SEO
- Executar testes cross-browser e responsividade completa.
- Validar checklist WCAG 2.1 AA (contraste, navegação por teclado, labels, landmarks, aria-live etc.).
- Rodar auditorias de performance (Lighthouse), otimizar imagens e bundle.
- Revisar SEO (titles, descriptions, OG, sitemap, robots, schema). Ajustar RLS/logs e deploy.

## Considerações de Arquitetura
- Next.js App Router com React 18 (SSR/SSG conforme necessidade) aliado ao Supabase (PostgreSQL, Auth, Storage) com RLS rigoroso.
- Design system baseado em shadcn/ui + Tailwind com tokens da marca (cores vibrantes, tipografia Quicksand/Inter, cantos arredondados, sombras suaves).
- Monorepo com pacotes reutilizáveis: `@monynha/ui` (componentes, estilos globais) e `@monynha/supabase` (clientes tipados, hooks de dados, helpers para service role). Possível expansão para `@monynha/utils`/`@monynha/config`.
- Organização por domínio no App Router (rotas, componentes co-localizados) e documentação interna para onboarding.

## QA, Acessibilidade e SEO — Checklist Final
- Compatibilidade em Chrome, Firefox, Safari, Edge e múltiplos tamanhos (mobile-first, sem scroll horizontal).
- Estrutura semântica consistente (headings, landmarks) e foco visível.
- Inputs com labels, mensagens de erro acessíveis (`aria-live`), imagens com `alt` significativo.
- Mega menu navegável via teclado e fechamento por `Esc`.
- Lighthouse > 90 em Performance, uso de `<Image>` e preloading de fontes quando necessário.
- Titles/metas únicos, OG/Twitter cards configurados, sitemap e robots atualizados, URLs amigáveis e `hreflang` para idiomas.
- Segurança: chaves sensíveis server-side, cookies `Secure`/`HttpOnly`, cabeçalhos padrões (HSTS, CSP opcional), páginas 404/500 customizadas.
- Fluxos críticos testados end-to-end (contato, auth, comentários, troca de idioma, modo escuro).

## Organização Sugerida dos Pacotes
- **@monynha/ui**: componentes atômicos e compostos, tokens de design, estilos globais, documentação de uso, testes unitários, build com tree-shaking.
- **@monynha/supabase**: criação de clientes (SSR/CSR), tipos gerados, hooks/utilitários, funções com service role, constantes de tabelas.
- Considerar pacotes auxiliares (`@monynha/utils`, `@monynha/config`) para utilidades puras e configs compartilhadas.
- Manter separação clara: UI não depende de dados; supabase não depende de React/UI. Automatizar builds (tsup/rollup), versionamento semântico e CI focado em pacotes afetados.

## Conclusão
A execução deste plano entrega um frontend completo, acessível e alinhado à identidade da Monynha Softwares. Cada sprint produz valor incremental, culminando em um site institucional robusto, pronto para lançamento e evoluções futuras.
