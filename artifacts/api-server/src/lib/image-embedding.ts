import sharp from "sharp";
import { logger } from "./logger";

export const EMBEDDING_MODEL = "sharp-normalized-logo-v2";

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
const MIN_IMAGE_SIDE = 16;
const IMAGE_SIZE = 64;
const RGB_CHANNELS = 3;
const COLOR_BINS = 8;
const COLOR_GRIDS = [4, 8] as const;
const GRAY_GRID = 16;
const EDGE_GRID = 8;
const FOREGROUND_GRID = 8;
const ORIENTATION_BINS = 8;

export const EMBEDDING_DIM =
  COLOR_GRIDS.reduce((sum, grid) => sum + grid * grid * RGB_CHANNELS, 0) +
  GRAY_GRID * GRAY_GRID +
  EDGE_GRID * EDGE_GRID +
  ORIENTATION_BINS +
  COLOR_BINS * RGB_CHANNELS +
  FOREGROUND_GRID * FOREGROUND_GRID +
  5 +
  6;

export type EmbeddingVector = number[];

export type PreprocessedImage = {
  raw: Buffer;
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
  trimmed: boolean;
};

export function normalizeVector(vector: EmbeddingVector): EmbeddingVector {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (!Number.isFinite(magnitude) || magnitude === 0) {
    throw new Error("Could not generate a usable image embedding.");
  }
  return vector.map((value) => value / magnitude);
}

function channelStats(values: number[]) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) * (value - mean), 0) / values.length;
  return { mean, std: Math.sqrt(variance) };
}

function luma(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function foregroundScore(r: number, g: number, b: number): number {
  const distanceFromWhite = Math.sqrt((1 - r) ** 2 + (1 - g) ** 2 + (1 - b) ** 2);
  const saturation = Math.max(r, g, b) - Math.min(r, g, b);
  return Math.max(distanceFromWhite, saturation * 0.75);
}

function pooledGridFeatures(values: number[], channels: number, grid: number): number[] {
  const cell = IMAGE_SIZE / grid;
  const features: number[] = [];

  for (let gy = 0; gy < grid; gy += 1) {
    for (let gx = 0; gx < grid; gx += 1) {
      const sums = new Array(channels).fill(0);
      for (let y = 0; y < cell; y += 1) {
        for (let x = 0; x < cell; x += 1) {
          const px = gx * cell + x;
          const py = gy * cell + y;
          const base = (py * IMAGE_SIZE + px) * channels;
          for (let c = 0; c < channels; c += 1) {
            sums[c] += values[base + c] ?? 0;
          }
        }
      }
      const count = cell * cell;
      for (const sum of sums) {
        features.push((sum / count - 0.5) * 2);
      }
    }
  }

  return features;
}

function edgeAndOrientationFeatures(gray: number[]): { edgeGrid: number[]; orientation: number[] } {
  const edge = new Array(IMAGE_SIZE * IMAGE_SIZE).fill(0);
  const orientation = new Array(ORIENTATION_BINS).fill(0);
  let max = 0;

  for (let y = 1; y < IMAGE_SIZE - 1; y += 1) {
    for (let x = 1; x < IMAGE_SIZE - 1; x += 1) {
      const i = y * IMAGE_SIZE + x;
      const gx =
        -gray[i - IMAGE_SIZE - 1] -
        2 * gray[i - 1] -
        gray[i + IMAGE_SIZE - 1] +
        gray[i - IMAGE_SIZE + 1] +
        2 * gray[i + 1] +
        gray[i + IMAGE_SIZE + 1];
      const gy =
        -gray[i - IMAGE_SIZE - 1] -
        2 * gray[i - IMAGE_SIZE] -
        gray[i - IMAGE_SIZE + 1] +
        gray[i + IMAGE_SIZE - 1] +
        2 * gray[i + IMAGE_SIZE] +
        gray[i + IMAGE_SIZE + 1];
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edge[i] = magnitude;
      if (magnitude > max) max = magnitude;

      if (magnitude > 0) {
        const angle = (Math.atan2(gy, gx) + Math.PI) / (Math.PI * 2);
        const bin = Math.min(ORIENTATION_BINS - 1, Math.floor(angle * ORIENTATION_BINS));
        orientation[bin] += magnitude;
      }
    }
  }

  const edgeGrid = pooledGridFeatures(edge, 1, EDGE_GRID).map((value) =>
    max > 0 ? (value + 1) / 2 / max : 0,
  );
  const totalOrientation = orientation.reduce((sum, value) => sum + value, 0);

  return {
    edgeGrid,
    orientation: totalOrientation > 0 ? orientation.map((value) => value / totalOrientation) : orientation,
  };
}

function foregroundFeatures(mask: boolean[]): number[] {
  const cell = IMAGE_SIZE / FOREGROUND_GRID;
  const features: number[] = [];
  let count = 0;
  let minX = IMAGE_SIZE;
  let minY = IMAGE_SIZE;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < IMAGE_SIZE; y += 1) {
    for (let x = 0; x < IMAGE_SIZE; x += 1) {
      if (!mask[y * IMAGE_SIZE + x]) continue;
      count += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  for (let gy = 0; gy < FOREGROUND_GRID; gy += 1) {
    for (let gx = 0; gx < FOREGROUND_GRID; gx += 1) {
      let cellCount = 0;
      for (let y = 0; y < cell; y += 1) {
        for (let x = 0; x < cell; x += 1) {
          const px = gx * cell + x;
          const py = gy * cell + y;
          if (mask[py * IMAGE_SIZE + px]) cellCount += 1;
        }
      }
      features.push(cellCount / (cell * cell));
    }
  }

  const foregroundRatio = count / (IMAGE_SIZE * IMAGE_SIZE);
  if (foregroundRatio < 0.002) {
    throw new Error("Image appears blank or too low contrast after preprocessing.");
  }

  const width = (maxX - minX + 1) / IMAGE_SIZE;
  const height = (maxY - minY + 1) / IMAGE_SIZE;
  const centerX = ((minX + maxX) / 2 + 0.5) / IMAGE_SIZE;
  const centerY = ((minY + maxY) / 2 + 0.5) / IMAGE_SIZE;

  return [...features, foregroundRatio, width, height, (centerX - 0.5) * 2, (centerY - 0.5) * 2];
}

export async function preprocessImage(buffer: Buffer): Promise<PreprocessedImage> {
  let metadata: sharp.Metadata;

  try {
    metadata = await sharp(buffer, { failOn: "error" }).metadata();
  } catch {
    logger.warn("Image preprocessing failed: metadata could not be read");
    throw new Error("Could not decode image. Use PNG, JPG, JPEG, WEBP, or a valid SVG.");
  }

  const sourceWidth = metadata.width ?? 0;
  const sourceHeight = metadata.height ?? 0;
  if (sourceWidth < MIN_IMAGE_SIDE || sourceHeight < MIN_IMAGE_SIDE) {
    logger.warn({ sourceWidth, sourceHeight }, "Image rejected because it is too small");
    throw new Error(`Image is too small. Minimum size is ${MIN_IMAGE_SIDE}x${MIN_IMAGE_SIDE}px.`);
  }

  const flattened = await sharp(buffer, { failOn: "error", limitInputPixels: 25_000_000 })
    .rotate()
    .flatten({ background: WHITE })
    .toColorspace("srgb")
    .removeAlpha()
    .png()
    .toBuffer();

  let inputForResize = flattened;
  let trimmed = false;

  try {
    const candidate = await sharp(flattened)
      .trim({ background: WHITE, threshold: 12 })
      .png()
      .toBuffer({ resolveWithObject: true });
    if ((candidate.info.width ?? 0) >= MIN_IMAGE_SIDE && (candidate.info.height ?? 0) >= MIN_IMAGE_SIDE) {
      inputForResize = candidate.data;
      trimmed = true;
    }
  } catch {
    trimmed = false;
  }

  const output = await sharp(inputForResize)
    .resize(IMAGE_SIZE, IMAGE_SIZE, {
      fit: "contain",
      background: WHITE,
      withoutEnlargement: false,
    })
    .flatten({ background: WHITE })
    .toColorspace("srgb")
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  logger.info(
    {
      sourceWidth,
      sourceHeight,
      width: output.info.width,
      height: output.info.height,
      trimmed,
    },
    "Image preprocessing completed",
  );

  return {
    raw: output.data,
    width: output.info.width,
    height: output.info.height,
    sourceWidth,
    sourceHeight,
    trimmed,
  };
}

// This local extractor is deliberately replaceable. It uses normalized,
// pooled color, luminance, edge, orientation, and foreground-shape features.
export async function generateImageEmbedding(buffer: Buffer): Promise<EmbeddingVector> {
  const image = await preprocessImage(buffer);
  const rgb: number[] = [];
  const gray: number[] = [];
  const channels: number[][] = [[], [], []];
  const histograms = Array.from({ length: RGB_CHANNELS }, () => new Array(COLOR_BINS).fill(0));
  const foregroundMask: boolean[] = [];
  const foregroundSamples: number[][] = [[], [], []];

  for (let i = 0; i < image.raw.length; i += RGB_CHANNELS) {
    const r = image.raw[i] / 255;
    const g = image.raw[i + 1] / 255;
    const b = image.raw[i + 2] / 255;
    const values = [r, g, b];

    rgb.push(r, g, b);
    gray.push(luma(r, g, b));

    const isForeground = foregroundScore(r, g, b) > 0.08;
    foregroundMask.push(isForeground);

    for (let c = 0; c < RGB_CHANNELS; c += 1) {
      const value = values[c];
      channels[c].push(value);
      if (isForeground) foregroundSamples[c].push(value);
      const bin = Math.min(COLOR_BINS - 1, Math.floor(value * COLOR_BINS));
      histograms[c][bin] += 1;
    }
  }

  const colorGridFeatures = COLOR_GRIDS.flatMap((grid) => pooledGridFeatures(rgb, RGB_CHANNELS, grid));
  const grayGridFeatures = pooledGridFeatures(gray, 1, GRAY_GRID);
  const { edgeGrid, orientation } = edgeAndOrientationFeatures(gray);
  const histogramFeatures = histograms.flatMap((histogram) =>
    histogram.map((count) => count / (IMAGE_SIZE * IMAGE_SIZE)),
  );
  const statFeatures = channels.flatMap((values, index) => {
    const stats = channelStats(foregroundSamples[index].length > 0 ? foregroundSamples[index] : values);
    return [(stats.mean - 0.5) * 2, stats.std * 2];
  });

  const vector = [
    ...colorGridFeatures,
    ...grayGridFeatures,
    ...edgeGrid,
    ...orientation,
    ...histogramFeatures,
    ...foregroundFeatures(foregroundMask),
    ...statFeatures,
  ];

  if (vector.length !== EMBEDDING_DIM) {
    throw new Error(`Unexpected embedding dimension: ${vector.length}`);
  }

  const normalized = normalizeVector(vector);
  logger.info({ model: EMBEDDING_MODEL, length: normalized.length }, "Embedding generated");
  return normalized;
}

export function averageEmbeddings(vectors: EmbeddingVector[]): EmbeddingVector {
  if (vectors.length === 0) {
    throw new Error("Cannot create a prototype without image embeddings.");
  }

  const dim = vectors[0].length;
  const sum = new Array(dim).fill(0);
  for (const vector of vectors) {
    const normalized = normalizeVector(vector);
    if (normalized.length !== dim) {
      throw new Error("Embedding dimensions do not match.");
    }
    for (let i = 0; i < dim; i += 1) {
      sum[i] += normalized[i];
    }
  }

  return normalizeVector(sum.map((value) => value / vectors.length));
}

export function cosineSimilarity(a: EmbeddingVector, b: EmbeddingVector): number {
  if (a.length !== b.length) {
    throw new Error("Cannot compare embeddings with different dimensions.");
  }

  const normalizedA = normalizeVector(a);
  const normalizedB = normalizeVector(b);
  let dot = 0;

  for (let i = 0; i < normalizedA.length; i += 1) {
    dot += normalizedA[i] * normalizedB[i];
  }

  return Math.max(-1, Math.min(1, dot));
}

export function scoreToPercentage(score: number | null): number | null {
  if (score === null) return null;
  return Math.round(Math.max(0, Math.min(1, score)) * 100);
}

export function serializeEmbedding(vector: EmbeddingVector): string {
  return JSON.stringify(normalizeVector(vector).map((value) => Number(value.toFixed(6))));
}

export function parseEmbedding(raw: string | null): EmbeddingVector | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const vector = parsed.map((value) => Number(value));
    return vector.every(Number.isFinite) ? normalizeVector(vector) : null;
  } catch {
    return null;
  }
}
