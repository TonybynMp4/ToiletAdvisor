FROM node:25-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
EXPOSE 3000

FROM base AS deps
# Installer toutes les dépendances
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY . .
RUN pnpm run build

FROM base AS prod-deps
# Installer les dépendances de production
RUN pnpm install --prod --frozen-lockfile

FROM base AS production
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
CMD [ "pnpm", "start" ]

FROM base AS development
COPY --from=deps /app/node_modules /app/node_modules
CMD [ "pnpm", "dev" ]