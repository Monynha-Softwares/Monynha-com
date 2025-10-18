# Monynha Softwares Web Spark

![CI/CD Status](https://github.com/Monynha-Softwares/Monynha-com/actions/workflows/deploy.yml/badge.svg)

Monynha Softwares Web Spark is a demo web application built with **React**, **Vite** and **Supabase**. It showcases common patterns such as authentication, data fetching and internationalisation using `react-i18next`. The project is configured to deploy automatically to Vercel via GitHub Actions.

## Running locally

1. Install dependencies
   ```sh
   npm install
   ```
2. Create matching environment files for the frontend and CMS workspaces.
   ```sh
   cp .env.example .env
   cp cms/.env.example cms/.env
   # edit both files and populate the required values listed below
   ```
3. Install the CMS dependencies (they live in a separate workspace).
   ```sh
   npm --prefix cms install
   ```
4. Start the development server
   ```sh
   npm run dev
   ```

The application will be available on [http://localhost:5173](http://localhost:5173) by default.

To boot Payload locally run the shared script from the repository root:

```sh
npm run cms:dev
```

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

- `npm run dev` – start the frontend development server
- `npm run lint` – run ESLint across the frontend workspace
- `npm run cms:dev` – run the Payload CMS development server
- `npm run cms:lint` – type-check the CMS workspace with TypeScript
- `npm run cms:build` – compile the CMS TypeScript sources
- `npm run test` – execute the Jest unit, integration and E2E suites
- `npm run build` – create a production build of the frontend
- `npm run sitemap` – generate `public/sitemap.xml`
- `npm run preview` – serve the production build locally using Vite

## Docker (Nixpacks)

The repository ships with a [`nixpacks.toml`](./nixpacks.toml) profile so you
can produce a production-ready Docker image with
[Railway's Nixpacks](https://nixpacks.com/). The generated image installs
dependencies with `npm ci`, builds the Vite bundle, and runs `npm run preview`
bound to `0.0.0.0:${PORT}` (defaults to `4173`).

```sh
# Build the container image (requires the nixpacks CLI)
nixpacks build . --name monynha-web

# Run the production server
docker run --rm -p 4173:4173 monynha-web
```

Use the `PORT` environment variable to expose a different port at runtime.

## Maintenance notes

- `ScrollToTop` now guards `window.scrollTo` calls so the SPA does not crash in
  non-browser environments (for example when running the Jest test suite).
- The SPA user journey test wraps user interactions in `act(...)` and extends
  the timeout window, eliminating the previous flakiness and allowing the full
  flow to complete reliably.
- Jest test setup stubs `window.scrollTo` globally to keep the test output
  quiet and aligned with the production runtime.

### Environment variables

Populate the following variables in `.env` to configure the frontend app and
automation scripts:

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase instance URL used by the frontend client. |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key exposed to the browser. |
| `SITE_URL` | Canonical site URL used when generating the sitemap. |
| `SUPABASE_PROJECT_ID` | Supabase project identifier for external tooling. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server-to-server jobs. |

The CMS workspace (`cms/.env`) requires its own secrets:

| Variable | Purpose |
| --- | --- |
| `PAYLOAD_SECRET` | Secret string for signing Payload authentication tokens. |
| `PAYLOAD_PUBLIC_SERVER_URL` | Public URL used by Payload when generating links. |
| `DATABASE_URL` | Postgres connection string shared with Supabase. |

## Authentication & Security

- [Authentication and security flows](docs/auth-flows.md): password reset lifecycle, dashboard MFA management, the admin RPC, and the Payload provisioning webhook.

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
