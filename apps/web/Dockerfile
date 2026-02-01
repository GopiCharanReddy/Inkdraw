FROM node:18-alpine AS base

# 1. Prune: separate the "web" app from the rest of the monorepo
FROM base AS builder
WORKDIR /app
RUN npm install -g pnpm
RUN pnpm install -g turbo
COPY . .
# This command is the magic. It isolates "web" and its dependencies.
RUN turbo prune --scope=web --docker

# 2. Install: Only install dependencies for "web"
FROM base AS installer
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# 3. Build: Compile the Next.js app
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm run build --filter=web

# 4. Run: Production server
FROM base AS runner
WORKDIR /app
USER node
# Don't run as root
COPY --from=installer /app/apps/web/next.config.js .
COPY --from=installer /app/apps/web/package.json .

# Automatically leverage output traces to reduce image size
COPY --from=installer --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=installer --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=node:node /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]