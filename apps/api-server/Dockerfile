FROM monorepo-base AS deps
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --filter api-server... --frozen-lockfile --dev

FROM monorepo-base AS build
COPY . .
RUN pnpm --filter api-server... run build

FROM monorepo-base AS prod-deps
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --filter api-server... --prod --frozen-lockfile

FROM monorepo-base AS production
WORKDIR /repo/apps/api-server

COPY --from=prod-deps /repo/node_modules /repo/node_modules
COPY --from=build /repo/apps/api-server/dist ./dist
COPY apps/api-server/package.json .
CMD [ "pnpm", "start" ]

FROM deps AS development
WORKDIR /repo/apps/api-server
CMD [ "pnpm", "dev" ]