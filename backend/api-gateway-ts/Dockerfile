FROM node:20-alpine

WORKDIR /repo

# pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Build context must be repository root.
COPY pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages ./packages
COPY backend/api-gateway-ts ./backend/api-gateway-ts

RUN pnpm install --frozen-lockfile=false
RUN pnpm -C packages/shared-types run build
RUN pnpm -C packages/shared-utils run build
RUN pnpm -C packages/shared-middleware run build
RUN pnpm -C backend/api-gateway-ts run build

EXPOSE 4100

CMD ["pnpm", "-C", "backend/api-gateway-ts", "start"]
