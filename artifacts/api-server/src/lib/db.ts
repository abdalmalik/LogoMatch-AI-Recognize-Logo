import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { logger } from "./logger";

const DATA_DIR = path.resolve(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "logomatch.db");

export const db: DatabaseSync = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS logo_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS recognition_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uploaded_filename TEXT NOT NULL,
    uploaded_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'demo',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_logo_images_company_id ON logo_images(company_id);
`);

logger.info({ path: DB_PATH }, "SQLite database ready");

export type CompanyRow = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
};

export type LogoImageRow = {
  id: number;
  company_id: number;
  filename: string;
  original_name: string;
  file_path: string;
  mime_type: string;
  size: number;
  created_at: string;
};

export type RecognitionTestRow = {
  id: number;
  uploaded_filename: string;
  uploaded_path: string;
  status: string;
  created_at: string;
};
