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
import { recognizeImageBuffer } from "../lib/recognition";

const router: IRouter = Router();

async function recognizeUpload(req: Request, res: Response) {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "An image file is required." });
    return;
  }

  const filename = uniqueFilename(file.originalname, file.mimetype);
  const absPath = path.join(RECOGNITION_UPLOADS, filename);

  try {
    const recognition = await recognizeImageBuffer(file.buffer);
    const url = publicPathFromAbsolute(absPath);
    fs.writeFileSync(absPath, file.buffer);

    const result = db
      .prepare(
        `INSERT INTO recognition_tests
          (uploaded_filename,
           uploaded_path,
           embedding_json,
           embedding_model,
           predicted_company_id,
           similarity_score,
           similarity_percentage,
           prediction_status,
           top_matches_json,
           status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        filename,
        absPath,
        recognition.embedding_json,
        recognition.embedding_model,
        recognition.predicted_company?.id ?? null,
        recognition.similarity_score,
        recognition.similarity_percentage,
        recognition.prediction_status,
        JSON.stringify(recognition.top_matches),
        recognition.status,
      );

    logger.info(
      {
        recognitionId: Number(result.lastInsertRowid),
        predictedCompany: recognition.predicted_company,
        confidence: recognition.prediction_status,
      },
      "Recognition result stored",
    );

    res.json({
      id: Number(result.lastInsertRowid),
      status: recognition.status,
      prediction_status: recognition.prediction_status,
      predicted_company: recognition.predicted_company,
      similarity_score: recognition.similarity_score,
      similarity_percentage: recognition.similarity_percentage,
      top_matches: recognition.top_matches,
      uploaded_image_path: url,
      original_name: file.originalname,
      embedding_model: recognition.embedding_model,
      embedding_dimension: recognition.embedding_dimension,
      message: recognition.message,
    });
  } catch (err) {
    logger.error({ err }, "Failed to recognize uploaded logo");
    try {
      fs.unlinkSync(absPath);
    } catch {
      /* ignore */
    }
    const message = err instanceof Error ? err.message : "Failed to process the upload.";
    res.status(400).json({ error: message });
  }
}

router.post("/recognize", uploadRecognitionImage.single("image"), recognizeUpload);
router.post("/recognize/demo", uploadRecognitionImage.single("image"), recognizeUpload);

// GET /api/recognize/tests - count + list (used by Dashboard)
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
