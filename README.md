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
  components/      Page-specific and layout components
  hooks/           Custom React hooks
  integrations/    Third‑party integrations (Supabase)
  pages/           Route components
  lib/             Utility helpers
packages/
  config/          Brand design tokens shared across apps
  ui/              Shared shadcn/ui components published as @monynha/ui
```

## Scripts

- `npm run dev` – start the development server
- `npm run lint` – run ESLint
- `npm run test` – run unit tests (none at the moment)
- `npm run build` – create a production build
- `npm run sitemap` – generate `public/sitemap.xml`

## Design system & shared packages

- **`@monynha/config`** centralises brand tokens (colors, radii, fonts, gradients). Tailwind consumes these tokens via `tailwind.config.ts`, and global CSS variables (`src/index.css`) mirror them for runtime usage.
- **`@monynha/ui`** now hosts all shared shadcn/ui components plus utilities such as `cn`. Import UI primitives from the package instead of local paths, e.g. `import { Button } from '@monynha/ui/button'` or grouped exports `import { Button, Card } from '@monynha/ui'`.
- Applications should extend these packages instead of duplicating styles to keep colours, rounded corners (`rounded-2xl`) and button proportions consistent.
- Brand typography is standardised to Inter (body), Space Grotesk (display) and JetBrains Mono (code) through `src/index.css`.

Run `npm install` from the repository root – the workspace will automatically link both packages.

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
- Tailwind CSS & shadcn/ui (via `@monynha/ui`)
- Supabase
- React Query

## CI/CD

Pull requests and pushes to `main` trigger the workflow defined in `.github/workflows/deploy.yml`. It installs dependencies, lints, runs tests, builds the project and deploys to Vercel. The following secrets must be provided in the GitHub repository settings:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## License

MIT
