# Statement Processor

This project follows a monorepo structure to keep the responsibilities clear:

- `apps/web` contains the React frontend responsible for validation and the failed-record table.
- `services/statement-merge` contains the Node API that merges CSV and XML statement data into a single record list.
- `packages/shared` contains the shared record contracts used by both layers.

## Branch workflow
The working branch is `feature/setup-monorepo`, and the project is structured to support a realistic multi-feature workflow such as:

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

## Architecture assumptions
- The Node API merges CSV/XML data only.
- Business validation happens in React.
- Failed records are shown in a report table and can be exported to PDF.
- Decimal math uses precise handling to avoid floating-point drift.

This repository intentionally leaves commit messages for the developer to write when ready.
