# LogoMatch AI

This is a pnpm workspace exported from Replit and adjusted for local VS Code development.

## Project Structure

- `artifacts/logomatch-ai` - React + Vite frontend.
- `artifacts/api-server` - Express API with SQLite, uploads, embeddings, prototypes, recognition, and evaluation.
- `artifacts/mockup-sandbox` - Replit mockup sandbox, not required for the main app.
- `lib/*` - shared workspace packages used by the app and API.
- `scripts` - workspace helper scripts.

This is a monorepo. The frontend and API run together from the workspace root.

## Requirements

- Node.js 24 or newer. The API uses Node's built-in `node:sqlite`.
- pnpm via Corepack.

## Install

This project uses pnpm workspaces. Do not run `npm install`.

```powershell
corepack pnpm install
```

If you already ran `npm install` and saw npm peer dependency warnings or `Cannot read properties of null`, ignore that failed npm run and install with pnpm instead.

## Development

Start the frontend and API together:

```powershell
corepack pnpm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend API:

```text
http://localhost:8080/api
```

Health check:

```text
http://localhost:8080/api/health
```

No `.env` file is required for local development. Optional defaults are documented in `.env.example`.

If `Port 5173 is already in use`, another copy of the frontend is still running. Stop the old VS Code terminal with `Ctrl+C`, or run:

```powershell
corepack pnpm run dev:stop
```

Then run `corepack pnpm run dev` again.

## VS Code Tasks

You can run the project without typing commands:

1. Open Command Palette.
2. Choose `Tasks: Run Task`.
3. Run `Install dependencies` once.
4. Run `Run LogoMatch AI`.

## Individual Services

Frontend only:

```powershell
corepack pnpm run dev:web
```

API only:

```powershell
corepack pnpm run dev:api
```

The frontend proxies `/api` to `http://localhost:8080` during local development. To use a different API URL, set `API_PROXY_TARGET` before starting the frontend.

## Local Data

- SQLite database: `artifacts/api-server/data/logomatch.db`
- Company uploads: `artifacts/api-server/uploads/companies`
- Recognition and evaluation uploads: `artifacts/api-server/uploads/recognition_tests`
- Image embeddings: `logo_images.embedding_json`
- Company prototypes: `companies.prototype_json`
- Recognition tests: `recognition_tests`
- Evaluation tests: `evaluation_results`

## Current Recognition Pipeline

Phase 3.5 uses a local, replaceable image embedding module in `artifacts/api-server/src/lib/image-embedding.ts`.

The current embedding model id is:

```text
sharp-normalized-logo-v2
```

It does not train a large model and it does not implement a Siamese Network or Prototypical Network. It uses Sharp to preprocess images and extract normalized visual features from color, luminance, edges, orientation, foreground shape, and channel statistics.

Recognition flow:

1. Add a company with exactly 5 logo images.
2. The API converts each image to RGB, handles transparency on a white background, trims safe empty padding, preserves aspect ratio, resizes to the extractor size, and rejects invalid or extremely small images.
3. The API generates one normalized embedding per support image.
4. The 5 normalized embeddings are averaged.
5. The averaged vector is normalized again and stored as the company prototype.
6. In `Recognize Logo`, one uploaded test image is embedded with the same preprocessing.
7. The test embedding is compared with every stored company prototype using cosine similarity.
8. The API returns the best allowed prediction, raw score, percentage score, and top 3 matches.

## Why 5 Images Per Company

Five images give the prototype a small support set instead of relying on one logo example. This helps the prototype absorb normal variation such as:

- Different image sizes.
- Transparent versus solid backgrounds.
- Slight crop differences.
- PNG/JPG/WEBP encoding differences.
- Minor color and padding changes.

Quality still matters. Five near-duplicate clean logos are usually better than five noisy screenshots.

## Prototype Matching

Prototype generation is handled in `artifacts/api-server/src/lib/prototypes.ts`.

For each company:

1. Generate embeddings for all stored support images.
2. Normalize each embedding vector.
3. Average the normalized embeddings.
4. Normalize the final averaged vector.
5. Store the final prototype vector with its model id and dimension.

You can regenerate prototypes from the Dataset Manager:

- `Regenerate Prototype` updates one company.
- `Regenerate All Prototypes` updates all companies that can be processed.

## Confidence Thresholds

Recognition thresholds are in `artifacts/api-server/src/lib/recognition.ts`.

```text
High confidence:   score >= 0.80
Medium confidence: score >= 0.65 and < 0.80
Low confidence:    score < 0.65
Unknown:           no usable prototypes exist
```

Low-confidence matches do not force a company prediction. The API returns `predicted_company: null` with the message `Unknown or low-confidence match`.

## Evaluation Mode

Open the frontend and go to `Evaluation`.

Use it to measure accuracy:

1. Select the expected company.
2. Upload one labeled test logo image.
3. Run evaluation.
4. The API stores expected company, predicted company, similarity score, confidence status, correctness, and timestamp.
5. The page shows total tests, correct tests, incorrect tests, and accuracy percentage.

Use images that were not part of the 5-image support set when you want a meaningful accuracy estimate.

## Dataset Quality Tips

- Use exactly 5 usable images per company.
- Prefer clean logos over screenshots with surrounding UI.
- Avoid images smaller than `16x16`.
- Keep transparent PNGs, JPGs, JPEGs, and WEBP files. The API composites transparency on white.
- Include normal logo variations, but avoid mixing unrelated marks under one company.
- Regenerate prototypes after changing the dataset or after extractor upgrades.
- Use Evaluation repeatedly with held-out test images to compare accuracy over time.
