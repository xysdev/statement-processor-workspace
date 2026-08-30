# syntax=docker/dockerfile:1.7

# ---- Dependencies + build (has npm/shell) ----
FROM cgr.dev/chainguard/node:latest-dev AS build

# Chainguard images default to a non-root user, but COPY writes files as root,
# so tsc/vite cannot create their output directories. The build stage is
# discarded and never shipped, so running it as root is safe; the runtime
# stage below still runs unprivileged.
USER root
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/web/package.json apps/web/package.json
COPY services/statement-merge/package.json services/statement-merge/package.json
RUN npm ci

COPY packages/shared packages/shared
COPY apps/web apps/web

# The API base URL is baked into the static bundle at build time by Vite.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build -w @statement/shared \
  && npm run build -w @statement/web

# ---- Runtime (hardened, non-root nginx, no shell) ----
FROM cgr.dev/chainguard/nginx:latest AS runtime
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
USER nonroot
