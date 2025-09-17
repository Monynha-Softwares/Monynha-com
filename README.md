# Monynha Softwares Web Spark

![CI/CD Status](https://github.com/Monynha-Softwares/Monynha-com/actions/workflows/deploy.yml/badge.svg)

Monynha Softwares Web Spark is a demo web application built with **React**, **Vite** and **Supabase**. It showcases common patterns such as authentication, data fetching and internationalisation using `react-i18next`. The project is configured to deploy automatically to Vercel via GitHub Actions.

## Running locally

1. Install dependencies
   ```sh
   npm install
   ```
2. Create a `.env` file based on `.env.example` and provide your Supabase credentials.
   ```sh
   cp .env.example .env
   # edit .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   ```
3. Start the development server
   ```sh
   npm run dev
   ```

The application will be available on [http://localhost:5173](http://localhost:5173) by default.

## Folder structure

```
src/
  components/      Reusable UI components
  hooks/           Custom React hooks
  integrations/    Third‑party integrations (Supabase)
  pages/           Route components
  lib/             Utility helpers
packages/
  config/          Centralised brand and configuration tokens (`@monynha/config`)
  ui/              Shared UI primitives and helpers (`@monynha/ui`)
```

The shared packages expose design tokens (colors, fonts, gradients) and brand-safe
components such as the new `SolutionCard` used across the Solutions and Projects
pages. Import them via the path aliases configured in `tsconfig.json` and `vite.config.ts`.

## Scripts

- `npm run dev` – start the development server
- `npm run lint` – run ESLint
- `npm run test` – run unit tests (none at the moment)
- `npm run build` – create a production build
- `npm run sitemap` – generate `public/sitemap.xml`

### Environment variables

Create a `.env` file in the project root with the following entries so the
Supabase client can connect to your instance:

```bash
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

These variables match the placeholders in `.env.example`.

## Technologies

- React & Vite
- TypeScript
- Tailwind CSS & shadcn/ui
- Supabase
- React Query

### Design tokens

- **Colors:** Violet `#7C3AED`, Blue `#0EA5E9`, Magenta `#EC4899`, Amber `#F97316` and a Pride gradient exposed via `@monynha/ui`.
- **Fonts:** Inter (body text), Space Grotesk (display/headings), JetBrains Mono (code).
- **Shape & elevation:** Buttons and cards default to `rounded-2xl` with `shadow-soft` variants.

These tokens are consumed through the Tailwind config and the shared UI package to ensure a cohesive visual language.

## Supabase schema updates

Recent migrations add comment-related RLS policies, a secure `get_comment_authors` helper, and seed the `site_settings.about_stats` entry used on the About page. Apply migrations before running locally:

```sh
npx supabase migration up
```

The frontend expects the following:

- Public read access to solutions, repositories, blog posts, homepage features, team members, site settings, and comments.
- Authenticated users can insert leads, newsletter subscribers, and comments while admins (via the `profiles.role = 'admin'` policy) can manage restricted tables.

## CI/CD

Pull requests and pushes to `main` trigger the workflow defined in `.github/workflows/deploy.yml`. It installs dependencies, lints, runs tests, builds the project and deploys to Vercel. The following secrets must be provided in the GitHub repository settings:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## License

MIT
