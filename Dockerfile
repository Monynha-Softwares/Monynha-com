# syntax=docker/dockerfile:1.7

FROM node:20-slim AS deps
WORKDIR /app
ENV CI=1

COPY package.json package-lock.json ./
RUN npm ci

COPY cms/package.json cms/package-lock.json ./cms/
RUN npm --prefix cms ci

FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build && npm --prefix cms run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4173

COPY --from=deps /app/package.json ./
COPY --from=deps /app/package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/cms ./cms
COPY --from=build /app/dist ./dist
COPY --from=build /app/cms/dist ./cms/dist
COPY --from=build /app/public ./public
COPY --from=build /app/index.html ./index.html
COPY --from=build /app/vite.config.ts ./vite.config.ts
COPY --from=build /app/tailwind.config.ts ./tailwind.config.ts
COPY --from=build /app/postcss.config.js ./postcss.config.js
COPY --from=build /app/tsconfig*.json ./
COPY --from=build /app/scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh
RUN chmod +x ./scripts/docker-entrypoint.sh

EXPOSE 4173 3000
ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
