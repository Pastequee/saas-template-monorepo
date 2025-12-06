# ================================
# Build Stage
# ================================
FROM oven/bun:latest AS build

WORKDIR /app

COPY /package.json package.json
COPY /bun.lock bun.lock

COPY /apps/backend/package.json ./apps/backend/package.json
COPY /apps/web/package.json ./apps/web/package.json

COPY /packages/db/package.json ./packages/db/package.json
COPY /packages/auth/package.json ./packages/auth/package.json
COPY /packages/utils/package.json ./packages/utils/package.json
COPY /packages/email/package.json ./packages/email/package.json

COPY /tooling/typescript/package.json ./tooling/typescript/package.json

RUN bun install --frozen-lockfile

COPY /apps/backend ./apps/backend

COPY /packages/db ./packages/db
COPY /packages/auth ./packages/auth
COPY /packages/utils ./packages/utils
COPY /packages/email ./packages/email

COPY /tooling/typescript ./tooling/typescript

ENV NODE_ENV=production

RUN bun build:backend

# ================================
# Production Stage
# ================================
FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/apps/backend/dist/server server

ENV NODE_ENV=production

EXPOSE 3001

CMD ["./server"]
