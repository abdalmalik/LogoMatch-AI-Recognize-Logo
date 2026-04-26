import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { db } from "../lib/db";
import { logger } from "../lib/logger";
import { recognizeImageBuffer } from "../lib/recognition";
import {
  publicPathFromAbsolute,
  RECOGNITION_UPLOADS,
  uniqueFilename,
  uploadRecognitionImage,
} from "../lib/uploads";

const router: IRouter = Router();

function loadEvaluationSummary() {
  const row = db
    .prepare(
      `SELECT
         COUNT(*) as total,
         COALESCE(SUM(CASE WHEN correct = 1 THEN 1 ELSE 0 END), 0) as correct,
         COALESCE(SUM(CASE WHEN correct = 0 THEN 1 ELSE 0 END), 0) as incorrect
       FROM evaluation_results`,
    )
    .get() as { total: number; correct: number; incorrect: number };

  const total = Number(row.total);
  const correct = Number(row.correct);
  const incorrect = Number(row.incorrect);

  return {
    total,
    correct,
    incorrect,
    accuracy_percentage: total > 0 ? Number(((correct / total) * 100).toFixed(1)) : 0,
  };
}

router.get("/evaluations/summary", (_req, res) => {
  res.json(loadEvaluationSummary());
});

router.get("/evaluations", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT
         e.id,
         e.expected_company_id,
         expected.name as expected_company_name,
         e.predicted_company_id,
         predicted.name as predicted_company_name,
         e.similarity_score,
         e.similarity_percentage,
         e.prediction_status,
         e.correct,
         e.created_at
       FROM evaluation_results e
       JOIN companies expected ON expected.id = e.expected_company_id
       LEFT JOIN companies predicted ON predicted.id = e.predicted_company_id
       ORDER BY e.id DESC
       LIMIT 25`,
    )
    .all();
  res.json({ evaluations: rows, summary: loadEvaluationSummary() });
});

router.post("/evaluations", uploadRecognitionImage.single("image"), async (req: Request, res: Response) => {
  const expectedCompanyId = Number(req.body?.expectedCompanyId);
  if (!Number.isInteger(expectedCompanyId) || expectedCompanyId <= 0) {
    res.status(400).json({ error: "A valid expected company is required." });
    return;
  }

  const expected = db
    .prepare("SELECT id, name FROM companies WHERE id = ?")
    .get(expectedCompanyId) as { id: number; name: string } | undefined;
  if (!expected) {
    res.status(404).json({ error: "Expected company was not found." });
    return;
  }

  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "An image file is required." });
    return;
  }

  const filename = uniqueFilename(`evaluation-${file.originalname}`, file.mimetype);
  const absPath = path.join(RECOGNITION_UPLOADS, filename);

  try {
    const recognition = await recognizeImageBuffer(file.buffer);
    const predictedId = recognition.predicted_company?.id ?? null;
    const correct = predictedId === expectedCompanyId ? 1 : 0;
    fs.writeFileSync(absPath, file.buffer);

    const result = db
      .prepare(
        `INSERT INTO evaluation_results
          (expected_company_id,
           predicted_company_id,
           uploaded_filename,
           uploaded_path,
           similarity_score,
           similarity_percentage,
           prediction_status,
           top_matches_json,
           correct)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        expectedCompanyId,
        predictedId,
        filename,
        absPath,
        recognition.similarity_score,
        recognition.similarity_percentage,
        recognition.prediction_status,
        JSON.stringify(recognition.top_matches),
        correct,
      );

    logger.info(
      {
        evaluationId: Number(result.lastInsertRowid),
        expectedCompanyId,
        predictedId,
        correct: correct === 1,
        predictionStatus: recognition.prediction_status,
      },
      "Evaluation result stored",
    );

    res.status(201).json({
      id: Number(result.lastInsertRowid),
      expected_company: expected,
      correct: correct === 1,
      uploaded_image_path: publicPathFromAbsolute(absPath),
      result: {
        status: recognition.status,
        prediction_status: recognition.prediction_status,
        predicted_company: recognition.predicted_company,
        similarity_score: recognition.similarity_score,
        similarity_percentage: recognition.similarity_percentage,
        top_matches: recognition.top_matches,
        message: recognition.message,
      },
      summary: loadEvaluationSummary(),
    });
  } catch (err) {
    logger.error({ err }, "Failed to evaluate uploaded logo");
    try {
      fs.unlinkSync(absPath);
    } catch {
      /* ignore */
    }
    const message = err instanceof Error ? err.message : "Failed to evaluate image.";
    res.status(400).json({ error: message });
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.warn({ err: err.message }, "Evaluation upload failed");
  res.status(400).json({ error: err.message });
});

export default router;
