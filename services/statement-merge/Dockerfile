# syntax=docker/dockerfile:1.7

# ---- Dependencies + build (has npm/shell) ----
FROM cgr.dev/chainguard/node:latest-dev AS build

# Chainguard images default to a non-root user, but COPY writes files as root,
# so tsc cannot create its output directories. The build stage is discarded and
# never shipped, so running it as root is safe; the runtime stage below still
# runs unprivileged.
USER root
WORKDIR /app

# Install once for the whole workspace so npm's hoisting/symlinking resolves
# @statement/shared correctly for every workspace that depends on it.
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/web/package.json apps/web/package.json
COPY services/statement-merge/package.json services/statement-merge/package.json
RUN npm ci

# Build the shared package first, then the API that depends on it.
COPY packages/shared packages/shared
COPY services/statement-merge services/statement-merge
RUN npm run build -w @statement/shared \
  && npm run build -w @statement/statement-merge

# Drop devDependencies from node_modules; only production deps ship at runtime.
RUN npm prune --omit=dev

# ---- Runtime (distroless, no shell, non-root by default) ----
FROM cgr.dev/chainguard/node:latest AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/services/statement-merge/package.json ./services/statement-merge/package.json
COPY --from=build /app/services/statement-merge/dist ./services/statement-merge/dist

EXPOSE 3001
USER nonroot
ENTRYPOINT ["node", "services/statement-merge/dist/server.js"]
