# Statement Processor

This project follows a monorepo structure to keep the responsibilities clear:

- `apps/web` contains the React frontend, validation report table, and browser print/PDF export action.
- `services/statement-merge` contains the Node API that reads, parses, merges, and validates CSV/XML statement data.
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
2. Start the API:
   - `npm run dev:api`
3. Start the frontend:
   - `npm run dev:web`

The API listens on `http://localhost:3001` and the Vite frontend uses its development server URL.

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

## Input files

Place the statement files here:

- `services/statement-merge/data/records.csv`
- `services/statement-merge/data/records.xml`

The API reads these files from the project and exposes them through `GET /api/records`. The React application does not need to provide file URLs.

## Records API

The Node service exposes a single endpoint: `GET /api/records`.

It reads both project files, parses them, merges them into one `records` array, and validates the merged data. The response has this shape:

```json
{
  "records": [],
  "validationIssues": []
}
```

`validationIssues` contains the reference, description, and reason for each duplicate-reference or balance-mismatch record.

## Architecture assumptions
- `src/app.ts` creates the Express app, defines the route, and loads the project files.
- `src/server.ts` starts the HTTP listener; keeping startup separate makes the app easy to test.
- The Node API performs authoritative validation, and React revalidates the received records for its UI.
- Validation functions live in `packages/shared/src/validation.ts` so both layers use the same rules.
- Money is converted to integer cents before balance calculations, avoiding floating-point drift.
- Failed records are shown in a report table and can be exported through the browser print dialog.

This repository intentionally leaves commit messages for the developer to write when ready.
