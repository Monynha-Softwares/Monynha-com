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

The animated "Liquid Ether" background is rendered with Three.js and loads on
the client only. It sits behind every page and automatically falls back to a
static gradient when WebGL is not available or when visitors prefer reduced
motion.

The effect can be configured through environment variables (either Vite's
`VITE_` prefix or the `NEXT_PUBLIC_` prefix for parity with Next.js setups):

```bash
# Enable/disable the WebGL background entirely (default: true)
NEXT_PUBLIC_LIQUIDETHER_ENABLED=true

# Downscale factor for the internal render resolution (0.3 – 0.6, default: 0.5)
NEXT_PUBLIC_LIQUIDETHER_RESOLUTION=0.5

# Multiplier applied to highlight intensity and shimmer (default: 2.2)
NEXT_PUBLIC_LIQUIDETHER_INTENSITY=2.2

# Comma-separated list of brand colours for the shader gradient (optional)
NEXT_PUBLIC_LIQUIDETHER_COLORS=#7C3AED,#0EA5E9,#EC4899
```

Runtime overrides are also exposed through the `LiquidEtherClient` component:

```tsx
<LiquidEtherClient
  colors={["#7C3AED", "#0EA5E9", "#EC4899"]}
  mouseForce={24}
  cursorSize={140}
  resolution={0.45}
  autoIntensity={2.8}
/>
```

By default the component samples the CSS design tokens
`--mona-primary`, `--mona-secondary` and `--mona-accent-pink`, defined in
`src/index.css`. Update those variables (or the `NEXT_PUBLIC_LIQUIDETHER_COLORS`
override) to keep the animation in sync with any branding changes.

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
