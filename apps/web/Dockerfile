# syntax=docker/dockerfile:1.7

# ---- Dependencies + build (has npm/shell) ----
FROM cgr.dev/chainguard/node:latest-dev AS build

# Build under the image's default non-root user. /home/nonroot is already owned
# by that user, so tsc and vite can create their output directories; COPY
# --chown keeps ownership of the sources consistent. WORKDIR under / would be
# root-owned and fail with EACCES.
WORKDIR /home/nonroot/app

COPY --chown=nonroot:nonroot package.json package-lock.json ./
COPY --chown=nonroot:nonroot packages/shared/package.json packages/shared/package.json
COPY --chown=nonroot:nonroot apps/web/package.json apps/web/package.json
COPY --chown=nonroot:nonroot services/statement-merge/package.json services/statement-merge/package.json
RUN npm ci

COPY --chown=nonroot:nonroot packages/shared packages/shared
COPY --chown=nonroot:nonroot apps/web apps/web

# The API base URL is baked into the static bundle at build time by Vite.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build -w @statement/shared \
  && npm run build -w @statement/web

# ---- Runtime (hardened, non-root nginx, no shell) ----
FROM cgr.dev/chainguard/nginx:latest AS runtime
COPY --from=build /home/nonroot/app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
USER nonroot
