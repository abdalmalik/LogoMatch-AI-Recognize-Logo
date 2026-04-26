import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import fs from "node:fs";
import path from "node:path";
import {
  db,
  type CompanyRow,
  type LogoImageRow,
} from "../lib/db";
import {
  uploadCompanyImages,
  companyDir,
  uniqueFilename,
  publicPathFromAbsolute,
  COMPANY_UPLOADS,
} from "../lib/uploads";
import { logger } from "../lib/logger";
import { rebuildAllCompanyPrototypes, rebuildCompanyPrototype } from "../lib/prototypes";
import { EMBEDDING_DIM, EMBEDDING_MODEL } from "../lib/image-embedding";

const router: IRouter = Router();

const REQUIRED_IMAGES = 5;

type LogoImageDto = {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

type CompanyDto = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  prototypeReady: boolean;
  prototypeModel: string | null;
  prototypeCreatedAt: string | null;
  images: LogoImageDto[];
};

function rowToImageDto(row: LogoImageRow): LogoImageDto {
  return {
    id: row.id,
    filename: row.filename,
    originalName: row.original_name,
    url: publicPathFromAbsolute(row.file_path),
    mimeType: row.mime_type,
    size: row.size,
    createdAt: row.created_at,
  };
}

function isPrototypeReady(company: CompanyRow): boolean {
  return (
    !!company.prototype_json &&
    company.prototype_model === EMBEDDING_MODEL &&
    company.prototype_dim === EMBEDDING_DIM
  );
}

function loadCompany(id: number): CompanyDto | null {
  const company = db
    .prepare("SELECT * FROM companies WHERE id = ?")
    .get(id) as CompanyRow | undefined;
  if (!company) return null;

  const images = db
    .prepare(
      "SELECT * FROM logo_images WHERE company_id = ? ORDER BY id ASC",
    )
    .all(company.id) as LogoImageRow[];

  return {
    id: company.id,
    name: company.name,
    description: company.description,
    createdAt: company.created_at,
    prototypeReady: isPrototypeReady(company),
    prototypeModel: company.prototype_model,
    prototypeCreatedAt: company.prototype_created_at,
    images: images.map(rowToImageDto),
  };
}

// GET /api/companies — list all companies with their images
router.get("/companies", (_req, res) => {
  const companies = db
    .prepare("SELECT * FROM companies ORDER BY id DESC")
    .all() as CompanyRow[];

  const result: CompanyDto[] = companies.map((c) => {
    const images = db
      .prepare(
        "SELECT * FROM logo_images WHERE company_id = ? ORDER BY id ASC",
      )
      .all(c.id) as LogoImageRow[];
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      createdAt: c.created_at,
      prototypeReady: isPrototypeReady(c),
      prototypeModel: c.prototype_model,
      prototypeCreatedAt: c.prototype_created_at,
      images: images.map(rowToImageDto),
    };
  });

  res.json({ companies: result });
});

router.post("/companies/prototypes/regenerate", async (_req, res) => {
  try {
    const results = await rebuildAllCompanyPrototypes();
    const regenerated = results.filter((result) => result.prototypeReady).length;
    const failed = results.length - regenerated;
    res.json({
      success: true,
      regenerated,
      failed,
      results,
    });
  } catch (err) {
    logger.error({ err }, "Failed to regenerate all prototypes");
    const message = err instanceof Error ? err.message : "Failed to regenerate prototypes.";
    res.status(500).json({ error: message });
  }
});

router.post("/companies/:id/prototype", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid company id" });
    return;
  }

  try {
    const result = await rebuildCompanyPrototype(id);
    const company = loadCompany(id);
    res.json({ success: true, result, company });
  } catch (err) {
    logger.error({ err, companyId: id }, "Failed to regenerate company prototype");
    const message = err instanceof Error ? err.message : "Failed to regenerate prototype.";
    res.status(400).json({ error: message });
  }
});

// GET /api/companies/:id — single company
router.get("/companies/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid company id" });
    return;
  }
  const company = loadCompany(id);
  if (!company) {
    res.status(404).json({ error: "Company not found" });
    return;
  }
  res.json({ company });
});

// POST /api/companies — create a company with exactly 5 images
router.post(
  "/companies",
  uploadCompanyImages.array("images", REQUIRED_IMAGES),
  async (req: Request, res: Response) => {
    const name = (req.body?.name ?? "").toString().trim();
    const description = (req.body?.description ?? "").toString().trim() || null;
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    if (!name) {
      res.status(400).json({ error: "Company name is required." });
      return;
    }

    if (files.length !== REQUIRED_IMAGES) {
      res.status(400).json({
        error: `Exactly ${REQUIRED_IMAGES} logo images are required. Received ${files.length}.`,
      });
      return;
    }

    const insertCompany = db.prepare(
      "INSERT INTO companies (name, description) VALUES (?, ?)",
    );
    const insertImage = db.prepare(
      `INSERT INTO logo_images
        (company_id, filename, original_name, file_path, mime_type, size)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );

    let companyId: number | null = null;
    const writtenFiles: string[] = [];

    try {
      const result = insertCompany.run(name, description);
      companyId = Number(result.lastInsertRowid);

      const dir = companyDir(companyId);

      for (const file of files) {
        const filename = uniqueFilename(file.originalname, file.mimetype);
        const absPath = path.join(dir, filename);
        fs.writeFileSync(absPath, file.buffer);
        writtenFiles.push(absPath);
        insertImage.run(
          companyId,
          filename,
          file.originalname,
          absPath,
          file.mimetype,
          file.size,
        );
      }

      await rebuildCompanyPrototype(companyId);

      const company = loadCompany(companyId);
      res.status(201).json({ company });
    } catch (err) {
      logger.error({ err }, "Failed to create company");
      // Roll back: delete written files and DB row
      for (const f of writtenFiles) {
        try {
          fs.unlinkSync(f);
        } catch {
          /* ignore */
        }
      }
      if (companyId !== null) {
        try {
          db.prepare("DELETE FROM companies WHERE id = ?").run(companyId);
          const dir = path.join(COMPANY_UPLOADS, `company_${companyId}`);
          fs.rmSync(dir, { recursive: true, force: true });
        } catch {
          /* ignore */
        }
      }
      const message = err instanceof Error ? err.message : "Failed to save company. Please try again.";
      res.status(400).json({ error: message });
    }
  },
);

// DELETE /api/companies/:id — delete company and its images from DB + disk
router.delete("/companies/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid company id" });
    return;
  }

  const company = db
    .prepare("SELECT id FROM companies WHERE id = ?")
    .get(id) as { id: number } | undefined;
  if (!company) {
    res.status(404).json({ error: "Company not found" });
    return;
  }

  // CASCADE removes image rows automatically; we also wipe the disk folder.
  db.prepare("DELETE FROM companies WHERE id = ?").run(id);
  const dir = path.join(COMPANY_UPLOADS, `company_${id}`);
  fs.rmSync(dir, { recursive: true, force: true });

  res.json({ success: true, id });
});

// Multer error handler scoped to this router
// (must have 4 args to be recognized as error handler)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.warn({ err: err.message }, "Upload validation failed");
  res.status(400).json({ error: err.message });
});

export default router;
