# Statement Processor

This project follows a monorepo structure to keep the responsibilities clear:

- `apps/web` contains the React frontend, validation report table, and browser print/PDF export action.
- `services/statement-merge` contains the Node API that accepts uploaded CSV/XML statement data, parses, merges, and validates it.
- `packages/shared` contains the shared record contracts and pure validation functions used by both layers.

## Branch workflow
The project is structured to support a realistic multi-feature workflow such as:

- `feature/node-merge-api`
- `feature/react-validation-ui`
- `feature/pdf-export`
- `feature/unit-tests-readme`

Each branch is intended to contain multiple commits so the history resembles a normal human development flow.

## Local development

1. Run `npm install` at the repo root.
2. Copy `apps/web/.env.example` to `apps/web/.env.local` and set `VITE_API_BASE_URL` if you need to override the default (see below).
3. Start the API:
   - `npm run dev:api`
4. Start the frontend:
   - `npm run dev:web`

The API listens on `http://localhost:3001` by default. The frontend reads its API base URL from `VITE_API_BASE_URL` (no hardcoded fallback in code); `apps/web/.env.development` provides `http://localhost:3001` as the local dev default, and `apps/web/.env.test` provides the same value for the test suite. Override it with a non-committed `apps/web/.env.local` to point at a different backend (e.g. staging).

## Testing and builds

Run all workspace tests:

```bash
npm test
```

Build all workspaces:

```bash
npm run build
```

Individual workspace tests can also be run with commands such as:

```bash
npm test -w @statement/shared
npm test -w @statement/statement-merge
npm test -w @statement/web
```

## Continuous integration

GitHub Actions runs the `CI` workflow for pull requests targeting `main` and for pushes to `main`. It installs dependencies with `npm ci`, runs all workspace tests, and builds all workspaces. The workflow is defined in `.github/workflows/ci.yml`.

A separate `Semgrep` workflow (`.github/workflows/semgrep.yml`) runs static application security testing (SAST) on pushes and pull requests to `main`, plus a weekly scheduled scan. It uses the free, self-contained `semgrep scan` (no Semgrep Cloud account/token required) with the `p/default`, `p/owasp-top-ten`, `p/javascript`, `p/typescript`, `p/react`, and `p/secrets` rulesets, fails the job if findings are detected, and uploads results as SARIF to GitHub's Security tab.

A `SonarCloud` workflow (`.github/workflows/sonarcloud.yml`) runs code quality and additional security analysis on pushes and pull requests to `main`. It runs `npm run test:coverage` (Vitest with V8 coverage across all three workspaces) and feeds the resulting LCOV reports into the scan so SonarCloud reports real test coverage, not just static analysis. Configuration lives in `sonar-project.properties` at the repo root (organization `xysdev`, project key `xysdev_statement-processor-workspace`). The workflow requires a `SONAR_TOKEN` repository secret (a SonarCloud user token) — it does not use SonarCloud's "Automatic Analysis" mode, since that mode is mutually exclusive with CI-based analysis and must be turned off in the SonarCloud project's Analysis Method settings.

Automatic deployment is intentionally not configured yet because a deployment platform and target environments have not been selected.

## Input files

Use the frontend upload form to select one `.csv` file and one `.xml` file. The API rejects uploads that are missing either file, include unsupported file extensions or MIME types, are empty, or exceed 1 MB per file.

The sample files remain in `services/statement-merge/data/` for local examples.

## Records API

The Node service exposes two endpoints:

- `POST /api/records/upload` accepts a multipart upload with one CSV file and one XML file in the `files` form field. It stores the files on the backend and returns an `uploadId`.
- `GET /api/records/:uploadId` reads the stored backend upload, parses and validates it, and returns the merged records.

The read response has this shape:

```json
{
  "records": [],
  "validationIssues": []
}
```

`validationIssues` contains the reference, description, and reason for each duplicate-reference or balance-mismatch record.

## Architecture assumptions
- `src/app.ts` creates the Express app, defines the upload route, and applies upload security checks.
- `src/server.ts` starts the HTTP listener; keeping startup separate makes the app easy to test.
- The frontend keeps page composition in `apps/web/src/App.tsx`, API access in `apps/web/src/api/`, and request/report state in `apps/web/src/hooks/`.
- Frontend components are colocated with their implementation, tests, and styles under `apps/web/src/components/`.
- `useRecords` manages the upload request lifecycle, while `useStatementReport` derives validation results, filter counts, and filtered records.
- The Node API performs authoritative validation, and React revalidates the received records for its UI.
- Validation functions live in `packages/shared/src/validation.ts` so both layers use the same rules.
- Money is converted to integer cents before balance calculations, avoiding floating-point drift.
- Records are shown in a report table that can be filtered to all records, balance mismatches, or duplicate references.
- Failed records are clearly marked, valid records are shown as valid, and the report can be exported through the browser print dialog.

## Running with Docker

Each deployable workspace has its own multi-stage `Dockerfile` using [Chainguard Images](https://www.chainguard.dev/chainguard-images) as the base:

- `services/statement-merge/Dockerfile` builds the API with `cgr.dev/chainguard/node:latest-dev` and ships it on the distroless `cgr.dev/chainguard/node:latest` runtime image (no shell, no package manager, runs as the built-in non-root `nonroot` user).
- `apps/web/Dockerfile` builds the static frontend bundle the same way, then serves it with the hardened `cgr.dev/chainguard/nginx:latest` image, also as `nonroot`.

Build and run both services together:

```bash
docker compose up --build
```

This starts:
- the API on `http://localhost:3001`
- the frontend on `http://localhost:8080`, built with `VITE_API_BASE_URL=http://localhost:3001` baked in at build time (see `docker-compose.yml` to change it)

Both containers run with `read_only: true` and a `tmpfs` mount at `/tmp` (the API's only writable path, since uploads are stored under the OS temp directory), plus `no-new-privileges`.

To build/run an individual image:

```bash
docker build -f services/statement-merge/Dockerfile -t statement-merge .
docker run -p 3001:3001 statement-merge

docker build -f apps/web/Dockerfile --build-arg VITE_API_BASE_URL=http://localhost:3001 -t statement-web .
docker run -p 8080:8080 statement-web
```

> These Dockerfiles were authored and reviewed for correctness but could not be built/run in this environment because Docker was not available. Verify locally with the commands above before deploying.

This repository intentionally leaves commit messages for the developer to write when ready.
