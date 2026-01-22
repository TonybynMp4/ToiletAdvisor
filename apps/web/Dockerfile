FROM monorepo-base AS deps
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --filter web... --frozen-lockfile

FROM monorepo-base AS build
COPY . .
RUN pnpm --filter web... run build

FROM nginx:1-alpine AS production

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

FROM deps AS development
CMD [ "pnpm", "dev" ]