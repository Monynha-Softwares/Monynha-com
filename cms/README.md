# Monynha CMS workspace

This directory contains the [Payload CMS](https://payloadcms.com/) instance used
for managing marketing content and syncing blog posts with Supabase.

## Getting started

1. Install dependencies from the repository root (recommended) or inside the
   workspace:
   ```sh
   npm --prefix cms install
   # or
   cd cms && npm install
   ```
2. Copy the sample environment file and fill in the required secrets:
   ```sh
   cp .env.example .env
   ```

## Required environment variables

| Variable | Purpose |
| --- | --- |
| `PAYLOAD_SECRET` | Secret string for signing Payload authentication tokens. |
| `PAYLOAD_PUBLIC_SERVER_URL` | Public URL Payload uses when generating links. |
| `DATABASE_URL` | Postgres connection string that points at your Supabase database. |

## Scripts

All scripts can be executed from the repository root via the shared npm
commands:

- `npm run cms:dev` – start the Payload development server.
- `npm run cms:lint` – run `tsc --noEmit` to type-check the CMS sources.
- `npm run cms:build` – compile the CMS TypeScript output used in production.

You can also run the equivalent scripts directly inside this directory with
`npm run dev`, `npm run lint`, and `npm run build`.
