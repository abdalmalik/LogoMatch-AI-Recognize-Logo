# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Hosts the LogoMatch AI web app — a futuristic AI dashboard for few-shot logo recognition.

## Artifacts

- `artifacts/logomatch-ai` — LogoMatch AI web app (React + Vite + Tailwind, dark futuristic UI). Phase 2: full backend integration via Express + SQLite + Multer. Real persistence, no AI model yet.
- `artifacts/api-server` — Express 5 API server with SQLite (built-in `node:sqlite` / `DatabaseSync`) and Multer file uploads. Hosts the LogoMatch AI backend.
- `artifacts/mockup-sandbox` — UI mockup workspace.

## LogoMatch AI

### Pages
- `/` — Landing page
- `/dashboard` — Metric overview backed by live API (`useCompaniesQuery`, `useRecognitionCountQuery`)
- `/add-logo` — Upload exactly 5 images + name + optional description → `POST /api/companies`
- `/recognize` — Upload one test image → `POST /api/recognize/demo` (records test, returns demo response)
- `/model-lab` — Architecture cards + training console (placeholder)
- `/dataset` — Dataset Manager driven by `GET /api/companies` with delete support
- `/experiments` — Experiment tracker (placeholder rows)

### State
- React Query (`@tanstack/react-query`) hooks in `src/store/companies.tsx`: `useCompaniesQuery`, `useCreateCompanyMutation`, `useDeleteCompanyMutation`, `useRecognizeDemoMutation`, `useRecognitionCountQuery`.
- Real fetch client in `src/services/api.ts` (root-relative `/api/...` URLs cross artifact boundaries via Replit proxy).

## API Server (LogoMatch backend)

### Endpoints
- `GET  /api/health` — service status
- `GET  /api/companies` — list all companies with their images (DESC by id)
- `POST /api/companies` — multipart: `name`, optional `description`, exactly 5 `images` (≤5 MB each, image/* MIME)
- `GET  /api/companies/:id` — single company
- `DELETE /api/companies/:id` — cascades images and deletes files from disk
- `POST /api/recognize/demo` — multipart: single `image`; saves test, returns demo response
- `GET  /api/recognize/count` — number of recognition tests run
- Static: `/api/uploads/...` serves stored images

### Storage
- SQLite file: `artifacts/api-server/data/logomatch.db`
- Tables: `companies`, `logo_images` (FK cascade), `recognition_tests`
- Uploaded files: `artifacts/api-server/uploads/companies/company_<id>/...` and `uploads/recognition_tests/...`
- Multer uses `memoryStorage`; files are written to disk only after the DB transaction succeeds (rollback on failure).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 18 + Vite + Tailwind v4 + framer-motion + wouter
- **API framework**: Express 5 + Multer (memoryStorage)
- **LogoMatch DB**: SQLite via Node.js built-in `node:sqlite` (`DatabaseSync`)
- **Other database (unused by LogoMatch)**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/logomatch-ai run typecheck` — typecheck only the web app
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Phase Roadmap

- **Phase 1 (done)**: Foundation, UI, upload system, dataset management — all in-browser.
- **Phase 2 (current)**: Express + SQLite + Multer backend, persistent dataset, real upload pipeline, demo recognition endpoint.
- **Phase 3 (planned)**: Real few-shot model (Prototypical / Siamese / image embeddings) + full recognition pipeline.
