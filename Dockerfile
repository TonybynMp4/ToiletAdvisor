FROM node:25-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm && \
	apk add --no-cache curl
RUN pnpm config set store-dir /pnpm/store

WORKDIR /app

FROM base AS build

COPY pnpm-lock.yaml pnpm-workspace.yaml /app/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch

COPY . /app

# Copy .env to each app for build time
COPY .env apps/web/.env
COPY .env apps/api-server/.env
COPY .env apps/auth-server/.env

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --offline
RUN pnpm run -r build
RUN pnpm deploy --filter=api-server --prod /prod/api-server && \
	cp -r /app/apps/api-server/dist /prod/api-server/ && \
	pnpm deploy --filter=auth-server --prod /prod/auth-server && \
	cp -r /app/apps/auth-server/dist /prod/auth-server/ && \
	pnpm deploy --filter=web --prod /prod/web && \
	cp -r /app/apps/web/build /prod/web/

FROM base AS api-server
COPY --from=build /prod/api-server .
CMD [ "pnpm", "start" ]

FROM base AS auth-server
COPY --from=build /prod/auth-server .
CMD [ "pnpm", "start" ]

FROM nginx:alpine AS web
COPY --from=build /prod/web/build/client /usr/share/nginx/html
COPY ./apps/web/nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]

FROM base AS db-migration
COPY --from=build /app/packages/db /app/packages/db
COPY --from=build /app/packages/env /app/packages/env
RUN pnpm add -g drizzle-kit
CMD ["pnpm", "db:migrate"]

# dev servers
FROM base AS dev-base
COPY . /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --offline

FROM dev-base AS api-server-dev
CMD [ "pnpm", "--filter", "api-server", "dev" ]

FROM dev-base AS auth-server-dev
CMD [ "pnpm", "--filter", "auth-server", "dev" ]

FROM dev-base AS web-dev
CMD [ "pnpm", "--filter", "web", "dev" ]