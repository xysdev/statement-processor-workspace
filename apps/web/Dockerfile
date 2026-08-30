# syntax=docker/dockerfile:1.7

# ---- Dependencies + build (has npm/shell) ----
FROM cgr.dev/chainguard/node:latest-dev AS build

# The Chainguard node image runs as the "node" user and $HOME (/home/node) is
# already owned by it, so tsc and vite can create their output directories
# there without any privilege escalation. A WORKDIR such as /app would instead
# be created root-owned and fail with EACCES.
WORKDIR /home/node/app

COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node packages/shared/package.json packages/shared/package.json
COPY --chown=node:node apps/web/package.json apps/web/package.json
COPY --chown=node:node services/statement-merge/package.json services/statement-merge/package.json
RUN npm ci

COPY --chown=node:node packages/shared packages/shared
COPY --chown=node:node apps/web apps/web

# The API base URL is baked into the static bundle at build time by Vite.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build -w @statement/shared \
  && npm run build -w @statement/web

# ---- Runtime (hardened, non-root nginx, no shell) ----
# The Chainguard nginx image runs as the "nginx" user, not "node".
FROM cgr.dev/chainguard/nginx:latest AS runtime
COPY --from=build /home/node/app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
# The image already defaults to this unprivileged user; stated explicitly so
# the guarantee survives any future change to the base image.
USER nginx
