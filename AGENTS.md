# AGENTS.md

Guidance for AI coding agents working in this NestJS backend.

## Project Scope

- Backend API for IMAGDD registration, sponsorship, voting, and Google Sheets sync.
- Tech stack: NestJS 11, TypeScript, Mongoose (MongoDB), Swagger.
- Primary domain rules and API examples live in [README.md](README.md).

## Fast Start Commands

- Install: `pnpm install`
- Dev server: `pnpm run start:dev`
- Build: `pnpm run build`
- Production start: `pnpm run start:prod`
- Lint (auto-fix enabled): `pnpm run lint`
- Format: `pnpm run format`
- Unit tests: `pnpm test`
- E2E tests: `pnpm run test:e2e`

## Architecture Map

- App bootstrap and DB wiring: [src/app.module.ts](src/app.module.ts), [src/main.ts](src/main.ts)
- Feature modules:
  - Registration: [src/registration](src/registration)
  - Sponsorship: [src/sponsorship](src/sponsorship)
  - Voting: [src/voting](src/voting)
  - Google Sheets integration: [src/google-sheets](src/google-sheets)

Module pattern to preserve:
- `*.module.ts` wires controllers/providers.
- `*.controller.ts` handles HTTP and Swagger decorators.
- `*.service.ts` contains business logic.
- DTO + schema files hold validation and persistence contracts.

## Conventions To Follow

- Use class-validator decorators in DTOs; rely on global ValidationPipe in [src/main.ts](src/main.ts).
- Keep controller logic thin; put data checks and domain decisions in services.
- Use Mongoose models via `@InjectModel(...)`.
- Preserve existing response/error behavior unless task explicitly requires contract change.
- Prefer small, focused edits over broad refactors.

## Domain-Critical Notes

Registration behavior is strict and should not be changed accidentally:
- Slot limits and pool rules are enforced in [src/registration/registration.service.ts](src/registration/registration.service.ts) and constants in [src/registration/registration.schema.ts](src/registration/registration.schema.ts).
- Duplicate email rejection and workshop capacity checks are intentional.

When modifying registration flow:
- Verify slot computations still match README rules.
- Add or update tests near changed module (`src/**/*.spec.ts` or `test/*.e2e-spec.ts`).

## Environment And Runtime Pitfalls

- `MONGODB_URI` is required for app startup.
- Optional Google sync requires both:
  - `GOOGLE_CREDENTIALS_JSON` (base64 JSON credentials)
  - `GOOGLE_SHEET_ID`
- On module init, registration service triggers a full sheet sync; avoid expensive startup regressions.
- CORS origins are explicitly configured in [src/main.ts](src/main.ts).

## Agent Working Rules

- Before changing code, inspect related module files and existing tests in the same folder.
- After edits, run targeted tests first, then broader checks:
  - Minimum: lint + relevant unit/e2e test path
  - Preferred before handoff: `pnpm run lint` and `pnpm test`
- Do not introduce new dependencies unless necessary for the task.
- Keep public API shapes stable unless the user requests API changes.

## Useful References

- API/domain docs: [README.md](README.md)
- Example HTTP requests: [sample-endpoints.http](sample-endpoints.http)
- E2E test config: [test/jest-e2e.json](test/jest-e2e.json)
- Deployment/start commands: [railway.json](railway.json)
