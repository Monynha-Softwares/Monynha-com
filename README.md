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
```

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

### Liquid Ether background

The animated Liquid Ether background is loaded globally from
`src/components/effects/LiquidEtherClient.tsx`. It renders behind the entire
application and automatically falls back to a static gradient when
`prefers-reduced-motion` is enabled or when the effect is disabled.

The effect reads the following optional environment variables (both
`NEXT_PUBLIC_` and `VITE_` prefixes are supported):

```bash
NEXT_PUBLIC_LIQUIDETHER_ENABLED=true # or false to disable the animation
NEXT_PUBLIC_LIQUIDETHER_RESOLUTION=0.5 # lower values improve performance
NEXT_PUBLIC_LIQUIDETHER_INTENSITY=2.2 # auto animation strength
```

You can customise colours and behaviour on a per-page basis by passing props to
`<LiquidEtherClient />`. By default it uses the Monynha design tokens:

- `--mona-primary: #7C3AED`
- `--mona-secondary: #0EA5E9`
- `--mona-accent-pink: #EC4899`

For example:

```tsx
<LiquidEtherClient colors={["#5227FF", "#FF9FFC", "#B19EEF"]} autoIntensity={1.6} />
```

If you need to provide additional contrast for text-heavy sections, wrap them in
containers that apply subtle backgrounds such as `bg-background/70` together with
`backdrop-blur-sm`.

## Technologies

- React & Vite
- TypeScript
- Tailwind CSS & shadcn/ui
- Supabase
- React Query

## CI/CD

Pull requests and pushes to `main` trigger the workflow defined in `.github/workflows/deploy.yml`. It installs dependencies, lints, runs tests, builds the project and deploys to Vercel. The following secrets must be provided in the GitHub repository settings:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## License

MIT
