import fs from "node:fs";
import { db, type LogoImageRow } from "./db";
import {
  averageEmbeddings,
  EMBEDDING_DIM,
  EMBEDDING_MODEL,
  generateImageEmbedding,
  normalizeVector,
  parseEmbedding,
  serializeEmbedding,
  type EmbeddingVector,
} from "./image-embedding";
import { logger } from "./logger";

export type PrototypeCompany = {
  id: number;
  name: string;
  prototype: EmbeddingVector;
};

export type PrototypeBuildResult = {
  companyId: number;
  imageCount: number;
  model: string;
  dimension: number;
  prototypeReady: boolean;
  error?: string;
};

export async function rebuildCompanyPrototype(companyId: number): Promise<PrototypeBuildResult> {
  const images = db
    .prepare("SELECT * FROM logo_images WHERE company_id = ? ORDER BY id ASC")
    .all(companyId) as LogoImageRow[];

  if (images.length === 0) {
    throw new Error("Cannot build a prototype without logo images.");
  }

  const embeddings: EmbeddingVector[] = [];
  logger.info({ companyId, imageCount: images.length }, "Prototype generation started");

  for (const image of images) {
    if (!fs.existsSync(image.file_path)) {
      throw new Error(`Missing logo image on disk: ${image.original_name}`);
    }

    const embedding = normalizeVector(await generateImageEmbedding(fs.readFileSync(image.file_path)));
    embeddings.push(embedding);

    db.prepare(
      `UPDATE logo_images
       SET embedding_json = ?, embedding_model = ?, embedding_dim = ?
       WHERE id = ?`,
    ).run(serializeEmbedding(embedding), EMBEDDING_MODEL, EMBEDDING_DIM, image.id);
  }

  const prototype = averageEmbeddings(embeddings);
  db.prepare(
    `UPDATE companies
     SET prototype_json = ?,
         prototype_model = ?,
         prototype_dim = ?,
         prototype_created_at = datetime('now')
     WHERE id = ?`,
  ).run(serializeEmbedding(prototype), EMBEDDING_MODEL, EMBEDDING_DIM, companyId);

  logger.info(
    { companyId, imageCount: images.length, model: EMBEDDING_MODEL, dimension: EMBEDDING_DIM },
    "Prototype generation completed",
  );

  return {
    companyId,
    imageCount: images.length,
    model: EMBEDDING_MODEL,
    dimension: EMBEDDING_DIM,
    prototypeReady: true,
  };
}

export function loadPrototypeCompanies(): PrototypeCompany[] {
  const rows = db
    .prepare(
      `SELECT id, name, prototype_json
       FROM companies
       WHERE prototype_json IS NOT NULL
         AND prototype_model = ?
         AND prototype_dim = ?`,
    )
    .all(EMBEDDING_MODEL, EMBEDDING_DIM) as Array<{
    id: number;
    name: string;
    prototype_json: string | null;
  }>;

  return rows.flatMap((row) => {
    const prototype = parseEmbedding(row.prototype_json);
    return prototype ? [{ id: row.id, name: row.name, prototype }] : [];
  });
}

export async function backfillMissingPrototypes(): Promise<void> {
  const rows = db
    .prepare(
      `SELECT c.id
       FROM companies c
       WHERE c.prototype_json IS NULL
          OR c.prototype_model IS NULL
          OR c.prototype_model != ?
          OR c.prototype_dim != ?`,
    )
    .all(EMBEDDING_MODEL, EMBEDDING_DIM) as Array<{ id: number }>;

  for (const row of rows) {
    try {
      await rebuildCompanyPrototype(row.id);
      logger.info({ companyId: row.id }, "Backfilled company prototype");
    } catch (err) {
      logger.warn({ err, companyId: row.id }, "Could not backfill company prototype");
    }
  }
}

export async function rebuildAllCompanyPrototypes(): Promise<PrototypeBuildResult[]> {
  const rows = db.prepare("SELECT id FROM companies ORDER BY id ASC").all() as Array<{ id: number }>;
  const results: PrototypeBuildResult[] = [];

  for (const row of rows) {
    try {
      results.push(await rebuildCompanyPrototype(row.id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to regenerate prototype.";
      logger.warn({ err, companyId: row.id }, "Could not regenerate company prototype");
      results.push({
        companyId: row.id,
        imageCount: 0,
        model: EMBEDDING_MODEL,
        dimension: EMBEDDING_DIM,
        prototypeReady: false,
        error: message,
      });
    }
  }

  return results;
}
