import path from "node:path";

const currentDir = import.meta.dirname;

export const API_ROOT =
  path.basename(currentDir) === "dist"
    ? path.resolve(currentDir, "..")
    : path.resolve(currentDir, "..", "..");

export const DATA_DIR = path.join(API_ROOT, "data");
export const UPLOADS_ROOT = path.join(API_ROOT, "uploads");
