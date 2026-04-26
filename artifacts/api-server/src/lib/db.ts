import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { logger } from "./logger";
import { DATA_DIR } from "./paths";

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
    prototype_json TEXT,
    prototype_model TEXT,
    prototype_dim INTEGER,
    prototype_created_at TEXT,
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
    embedding_json TEXT,
    embedding_model TEXT,
    embedding_dim INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS recognition_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uploaded_filename TEXT NOT NULL,
    uploaded_path TEXT NOT NULL,
    embedding_json TEXT,
    embedding_model TEXT,
    predicted_company_id INTEGER,
    similarity_score REAL,
    similarity_percentage REAL,
    prediction_status TEXT,
    top_matches_json TEXT,
    status TEXT NOT NULL DEFAULT 'demo',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS evaluation_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expected_company_id INTEGER NOT NULL,
    predicted_company_id INTEGER,
    uploaded_filename TEXT NOT NULL,
    uploaded_path TEXT NOT NULL,
    similarity_score REAL,
    similarity_percentage REAL,
    prediction_status TEXT NOT NULL,
    top_matches_json TEXT,
    correct INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (expected_company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (predicted_company_id) REFERENCES companies(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_logo_images_company_id ON logo_images(company_id);
`);

function tableColumns(table: string): Set<string> {
  return new Set(
    (
      db.prepare(`PRAGMA table_info(${table})`).all() as Array<{
        name: string;
      }>
    ).map((column) => column.name),
  );
}

function ensureColumn(table: string, column: string, definition: string) {
  const columns = tableColumns(table);
  if (!columns.has(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
  }
}

ensureColumn("companies", "prototype_json", "prototype_json TEXT");
ensureColumn("companies", "prototype_model", "prototype_model TEXT");
ensureColumn("companies", "prototype_dim", "prototype_dim INTEGER");
ensureColumn("companies", "prototype_created_at", "prototype_created_at TEXT");

ensureColumn("logo_images", "embedding_json", "embedding_json TEXT");
ensureColumn("logo_images", "embedding_model", "embedding_model TEXT");
ensureColumn("logo_images", "embedding_dim", "embedding_dim INTEGER");

ensureColumn("recognition_tests", "embedding_json", "embedding_json TEXT");
ensureColumn("recognition_tests", "embedding_model", "embedding_model TEXT");
ensureColumn("recognition_tests", "predicted_company_id", "predicted_company_id INTEGER");
ensureColumn("recognition_tests", "similarity_score", "similarity_score REAL");
ensureColumn("recognition_tests", "similarity_percentage", "similarity_percentage REAL");
ensureColumn("recognition_tests", "prediction_status", "prediction_status TEXT");
ensureColumn("recognition_tests", "top_matches_json", "top_matches_json TEXT");

ensureColumn("evaluation_results", "similarity_percentage", "similarity_percentage REAL");
ensureColumn("evaluation_results", "prediction_status", "prediction_status TEXT");
ensureColumn("evaluation_results", "top_matches_json", "top_matches_json TEXT");

logger.info({ path: DB_PATH }, "SQLite database ready");

export type CompanyRow = {
  id: number;
  name: string;
  description: string | null;
  prototype_json: string | null;
  prototype_model: string | null;
  prototype_dim: number | null;
  prototype_created_at: string | null;
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
  embedding_json: string | null;
  embedding_model: string | null;
  embedding_dim: number | null;
  created_at: string;
};

export type RecognitionTestRow = {
  id: number;
  uploaded_filename: string;
  uploaded_path: string;
  embedding_json: string | null;
  embedding_model: string | null;
  predicted_company_id: number | null;
  similarity_score: number | null;
  similarity_percentage: number | null;
  prediction_status: string | null;
  top_matches_json: string | null;
  status: string;
  created_at: string;
};

export type EvaluationResultRow = {
  id: number;
  expected_company_id: number;
  predicted_company_id: number | null;
  uploaded_filename: string;
  uploaded_path: string;
  similarity_score: number | null;
  similarity_percentage: number | null;
  prediction_status: string;
  top_matches_json: string | null;
  correct: number;
  created_at: string;
};
