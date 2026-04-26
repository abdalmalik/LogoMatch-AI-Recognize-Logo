import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import fs from "node:fs";
import path from "node:path";
import { db } from "../lib/db";
import {
  uploadRecognitionImage,
  RECOGNITION_UPLOADS,
  uniqueFilename,
  publicPathFromAbsolute,
} from "../lib/uploads";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// POST /api/recognize/demo — accepts one image, stores it, returns demo result
router.post(
  "/recognize/demo",
  uploadRecognitionImage.single("image"),
  (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "An image file is required." });
      return;
    }

    const filename = uniqueFilename(file.originalname, file.mimetype);
    const absPath = path.join(RECOGNITION_UPLOADS, filename);

    try {
      fs.writeFileSync(absPath, file.buffer);
      const result = db
        .prepare(
          `INSERT INTO recognition_tests
            (uploaded_filename, uploaded_path, status)
           VALUES (?, ?, ?)`,
        )
        .run(filename, absPath, "demo");

      const url = publicPathFromAbsolute(absPath);

      res.json({
        id: Number(result.lastInsertRowid),
        status: "Demo Mode",
        message:
          "Upload received successfully. Real AI recognition will be added in Phase 3.",
        uploaded_image_path: url,
        original_name: file.originalname,
        similarity_score: null,
        predicted_company: null,
      });
    } catch (err) {
      logger.error({ err }, "Failed to save recognition test");
      try {
        fs.unlinkSync(absPath);
      } catch {
        /* ignore */
      }
      res.status(500).json({ error: "Failed to process the upload." });
    }
  },
);

// GET /api/recognize/tests — count + list (used by Dashboard)
router.get("/recognize/tests", (_req, res) => {
  const row = db
    .prepare("SELECT COUNT(*) as count FROM recognition_tests")
    .get() as { count: number };
  res.json({ count: row.count });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.warn({ err: err.message }, "Recognize upload failed");
  res.status(400).json({ error: err.message });
});

export default router;
