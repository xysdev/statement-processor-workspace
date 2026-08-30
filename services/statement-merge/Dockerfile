# syntax=docker/dockerfile:1.7

# ---- Dependencies + build (has npm/shell) ----
FROM cgr.dev/chainguard/node:latest-dev AS build

# The Chainguard node image runs as the "node" user and $HOME (/home/node) is
# already owned by it, so tsc can create its output directories there without
# any privilege escalation. A WORKDIR such as /app would instead be created
# root-owned and fail with EACCES.
WORKDIR /home/node/app

# Install once for the whole workspace so npm's hoisting/symlinking resolves
# @statement/shared correctly for every workspace that depends on it.
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node packages/shared/package.json packages/shared/package.json
COPY --chown=node:node apps/web/package.json apps/web/package.json
COPY --chown=node:node services/statement-merge/package.json services/statement-merge/package.json
RUN npm ci

# Build the shared package first, then the API that depends on it.
COPY --chown=node:node packages/shared packages/shared
COPY --chown=node:node services/statement-merge services/statement-merge
RUN npm run build -w @statement/shared \
  && npm run build -w @statement/statement-merge

# Drop devDependencies from node_modules; only production deps ship at runtime.
RUN npm prune --omit=dev

# ---- Runtime (distroless, no shell, non-root by default) ----
FROM cgr.dev/chainguard/node:latest AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /home/node/app/node_modules ./node_modules
COPY --from=build /home/node/app/package.json ./package.json
COPY --from=build /home/node/app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /home/node/app/packages/shared/dist ./packages/shared/dist
COPY --from=build /home/node/app/services/statement-merge/package.json ./services/statement-merge/package.json
COPY --from=build /home/node/app/services/statement-merge/dist ./services/statement-merge/dist

EXPOSE 3001
# The image already defaults to this unprivileged user; stated explicitly so
# the guarantee survives any future change to the base image.
USER node
ENTRYPOINT ["node", "services/statement-merge/dist/server.js"]
