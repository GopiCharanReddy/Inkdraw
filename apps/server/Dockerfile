FROM node:24-alpine AS base

FROM base AS builder
WORKDIR /app
RUN npm install -g pnpm
RUN npm install -g turbo
COPY . .
# Change "http-backend" to whatever is in your package.json "name" field
RUN turbo prune --scope=server --docker

FROM base AS installer
WORKDIR /app
RUN npm install -g pnpm
RUN npm install -g turbo
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm install

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN npm run build --filter=server

FROM base AS runner
WORKDIR /app
COPY --from=installer /app .

CMD ["node", "apps/server/dist/index.js"]