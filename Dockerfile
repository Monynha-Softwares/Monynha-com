# syntax=docker/dockerfile:1.4

FROM node:20-bullseye-slim AS base
WORKDIR /app
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY package.json package-lock.json ./
COPY cms/package.json cms/package.json
COPY cms/package-lock.json cms/package-lock.json

RUN npm ci \
  && npm --prefix cms ci

COPY . .

RUN npm run build \
  && npm run cms:build

FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    NPM_CONFIG_LOGLEVEL=warn

COPY --from=base /app/package.json ./
COPY --from=base /app/package-lock.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/scripts ./scripts
COPY --from=base /app/vite.config.ts ./vite.config.ts
COPY --from=base /app/tsconfig.json ./tsconfig.json
COPY --from=base /app/tsconfig.app.json ./tsconfig.app.json
COPY --from=base /app/tsconfig.node.json ./tsconfig.node.json

EXPOSE 4173

CMD ["npm", "start"]
