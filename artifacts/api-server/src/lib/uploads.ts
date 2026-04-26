import path from "node:path";
import fs from "node:fs";
import multer from "multer";
import { randomBytes } from "node:crypto";
import { UPLOADS_ROOT } from "./paths";

export { UPLOADS_ROOT } from "./paths";

export const COMPANY_UPLOADS = path.join(UPLOADS_ROOT, "companies");
export const RECOGNITION_UPLOADS = path.join(UPLOADS_ROOT, "recognition_tests");

for (const dir of [UPLOADS_ROOT, COMPANY_UPLOADS, RECOGNITION_UPLOADS]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "image/webp",
]);

const imageOnlyFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (ALLOWED_MIME.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per file

// Memory storage so we can write files only after a successful DB insert.
export const uploadCompanyImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 5 },
  fileFilter: imageOnlyFilter,
});

export const uploadRecognitionImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: imageOnlyFilter,
});

export function safeExtension(originalName: string, mime: string): string {
  const fromName = path.extname(originalName).toLowerCase();
  if (fromName) return fromName;
  const map: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/svg+xml": ".svg",
    "image/webp": ".webp",
  };
  return map[mime] ?? ".bin";
}

export function uniqueFilename(originalName: string, mime: string): string {
  const ext = safeExtension(originalName, mime);
  return `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
}

export function companyDir(companyId: number): string {
  const dir = path.join(COMPANY_UPLOADS, `company_${companyId}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function publicPathFromAbsolute(absPath: string): string {
  // Convert an absolute file path under uploads/ into a URL the frontend can fetch.
  const rel = path.relative(UPLOADS_ROOT, absPath).split(path.sep).join("/");
  return `/api/uploads/${rel}`;
}
