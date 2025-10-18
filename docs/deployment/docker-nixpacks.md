# Docker & Nixpacks deployment guide

This document outlines how the container workflow fits together.

## Overview

- **Dockerfile** – multi-stage build that installs dependencies, runs the Vite
  build, compiles the Payload CMS and copies the production artefacts into a
  lean runtime image.
- **nixpacks.toml** – mirrors the Docker build so the same steps execute when
  Nixpacks generates an image. Two process types (`web` and `cms`) are exposed so
  hosting providers can run either service from the same source repository.
- **scripts/docker-entrypoint.sh** – tiny dispatcher that reads `APP_SERVICE`
  and starts either the SPA (`npm run preview`) or the Payload CMS server.

## Building locally

```sh
# Build the image
docker build -t monynha-app .

# Run the SPA (vite preview)
docker run --rm --env-file .env -p 4173:4173 monynha-app

# Boot the CMS instead
docker run --rm --env-file cms/.env -e APP_SERVICE=cms -p 3000:3000 monynha-app
```

The container expects the same environment variables as the local setup. For
Payload, ensure `PAYLOAD_SECRET`, `PAYLOAD_PUBLIC_SERVER_URL` and `DATABASE_URL`
are defined in the supplied `.env` file.

## Using Nixpacks directly

```sh
# Build with the included plan
nixpacks build . --config nixpacks.toml --name monynha-app

# Run one of the defined processes
nixpacks run monynha-app --process web
nixpacks run monynha-app --process cms
```

The plan caches `node_modules` from both workspaces between builds to speed up
subsequent deploys.
