# syntax=docker/dockerfile:1.7

# ---- Dependencies + build (has npm/shell) ----
FROM cgr.dev/chainguard/node:latest-dev AS build

# Build under the image's default non-root user. /home/nonroot is already owned
# by that user, so tsc can create its output directories; COPY --chown keeps
# ownership of the sources consistent. WORKDIR under / would be root-owned and
# fail with EACCES.
WORKDIR /home/nonroot/app

# Install once for the whole workspace so npm's hoisting/symlinking resolves
# @statement/shared correctly for every workspace that depends on it.
COPY --chown=nonroot:nonroot package.json package-lock.json ./
COPY --chown=nonroot:nonroot packages/shared/package.json packages/shared/package.json
COPY --chown=nonroot:nonroot apps/web/package.json apps/web/package.json
COPY --chown=nonroot:nonroot services/statement-merge/package.json services/statement-merge/package.json
RUN npm ci

# Build the shared package first, then the API that depends on it.
COPY --chown=nonroot:nonroot packages/shared packages/shared
COPY --chown=nonroot:nonroot services/statement-merge services/statement-merge
RUN npm run build -w @statement/shared \
  && npm run build -w @statement/statement-merge

# Drop devDependencies from node_modules; only production deps ship at runtime.
RUN npm prune --omit=dev

# ---- Runtime (distroless, no shell, non-root by default) ----
FROM cgr.dev/chainguard/node:latest AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /home/nonroot/app/node_modules ./node_modules
COPY --from=build /home/nonroot/app/package.json ./package.json
COPY --from=build /home/nonroot/app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /home/nonroot/app/packages/shared/dist ./packages/shared/dist
COPY --from=build /home/nonroot/app/services/statement-merge/package.json ./services/statement-merge/package.json
COPY --from=build /home/nonroot/app/services/statement-merge/dist ./services/statement-merge/dist

EXPOSE 3001
USER nonroot
ENTRYPOINT ["node", "services/statement-merge/dist/server.js"]
