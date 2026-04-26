# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Hosts the LogoMatch AI web app — a futuristic AI dashboard for few-shot logo recognition.

## Artifacts

- `artifacts/logomatch-ai` — LogoMatch AI web app (React + Vite + Tailwind, dark futuristic UI). Phase 1: foundation, UI, and frontend-only upload system. No real AI model or backend yet.
- `artifacts/api-server` — Express 5 API server scaffold (currently only health endpoint).
- `artifacts/mockup-sandbox` — UI mockup workspace.

## LogoMatch AI

### Pages
- `/` — Landing page
- `/dashboard` — Metric overview (Total Companies, Uploaded Logo Images, Recognition Tests, Model Status)
- `/add-logo` — Add a company by uploading exactly 5 logo images
- `/recognize` — Upload one test image (placeholder result, model not connected)
- `/model-lab` — Architecture cards (Prototypical, Siamese, Image Similarity) + training console (placeholder)
- `/dataset` — Dataset Manager listing every saved company
- `/experiments` — Experiment tracker (placeholder rows)

### State
- In-memory React Context (`src/store/companies.tsx`) — companies persist only for the current browser session.
- Images are stored as base64 data URLs so previews survive navigation.

### Backend-ready scaffolding
- `src/services/api.ts` contains stub async functions (`addCompanyApi`, `listCompaniesApi`, `recognizeLogoApi`) commented with the future FastAPI endpoints they will call. Pages currently call the in-memory store directly.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 18 + Vite + Tailwind v4 + framer-motion + wouter
- **API framework (scaffold only)**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (not yet used by LogoMatch AI)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/logomatch-ai run typecheck` — typecheck only the web app
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Phase Roadmap

- **Phase 1 (current)**: Foundation, UI, upload system, dataset management — all in-browser.
- **Phase 2 (planned)**: FastAPI backend, real few-shot model (Prototypical / Siamese / image embeddings), recognition pipeline, persistent dataset.
