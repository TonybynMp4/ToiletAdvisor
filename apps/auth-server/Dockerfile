FROM monorepo-base AS deps
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --filter auth-server... --frozen-lockfile --dev

FROM monorepo-base AS build
COPY . .
RUN pnpm --filter auth-server... run build

FROM monorepo-base AS prod-deps
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --filter auth-server... --prod --frozen-lockfile

FROM monorepo-base AS production
WORKDIR /repo/apps/auth-server

COPY --from=prod-deps /repo/node_modules /repo/node_modules
COPY --from=build /repo/apps/auth-server/dist ./dist
COPY apps/auth-server/package.json .
CMD [ "pnpm", "start" ]

FROM deps AS development
WORKDIR /repo/apps/auth-server
CMD [ "pnpm", "dev" ]