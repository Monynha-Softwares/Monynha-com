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
- `npm run test` – run unit tests (none at the moment)
- `npm run build` – create a production build of the frontend
- `npm run sitemap` – generate `public/sitemap.xml`

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
