import {
  cosineSimilarity,
  EMBEDDING_DIM,
  EMBEDDING_MODEL,
  generateImageEmbedding,
  scoreToPercentage,
  serializeEmbedding,
  type EmbeddingVector,
} from "./image-embedding";
import { logger } from "./logger";
import { loadPrototypeCompanies } from "./prototypes";

export const HIGH_CONFIDENCE_THRESHOLD = 0.8;
export const MEDIUM_CONFIDENCE_THRESHOLD = 0.65;

export type PredictionStatus =
  | "high_confidence"
  | "medium_confidence"
  | "low_confidence"
  | "unknown";

export type TopMatchDto = {
  company_id: number;
  company_name: string;
  score: number;
  percentage: number;
};

export type RecognitionMatchResult = {
  status: "success";
  prediction_status: PredictionStatus;
  predicted_company: {
    id: number;
    name: string;
  } | null;
  similarity_score: number | null;
  similarity_percentage: number | null;
  top_matches: TopMatchDto[];
  message: string;
  embedding: EmbeddingVector;
  embedding_json: string;
  embedding_model: string;
  embedding_dimension: number;
};

export function predictionStatusForScore(score: number | null): PredictionStatus {
  if (score === null) return "unknown";
  if (score >= HIGH_CONFIDENCE_THRESHOLD) return "high_confidence";
  if (score >= MEDIUM_CONFIDENCE_THRESHOLD) return "medium_confidence";
  return "low_confidence";
}

function messageForStatus(status: PredictionStatus): string {
  if (status === "high_confidence") {
    return "Recognition completed using normalized prototype matching.";
  }
  if (status === "medium_confidence") {
    return "Recognition completed with medium confidence. Review the top matches.";
  }
  if (status === "low_confidence") {
    return "Unknown or low-confidence match. The uploaded logo does not confidently match any stored company.";
  }
  return "No company prototypes exist yet. Add a company with 5 usable logo images first.";
}

export async function recognizeImageBuffer(buffer: Buffer): Promise<RecognitionMatchResult> {
  const embedding = await generateImageEmbedding(buffer);
  const prototypes = loadPrototypeCompanies();

  if (prototypes.length === 0) {
    logger.warn("Recognition skipped because no prototypes are available");
    return {
      status: "success",
      prediction_status: "unknown",
      predicted_company: null,
      similarity_score: null,
      similarity_percentage: null,
      top_matches: [],
      message: messageForStatus("unknown"),
      embedding,
      embedding_json: serializeEmbedding(embedding),
      embedding_model: EMBEDDING_MODEL,
      embedding_dimension: EMBEDDING_DIM,
    };
  }

  const allMatches: TopMatchDto[] = prototypes
    .map((company) => {
      const score = cosineSimilarity(embedding, company.prototype);
      return {
        company_id: company.id,
        company_name: company.name,
        score,
        percentage: scoreToPercentage(score) ?? 0,
      };
    })
    .sort((a, b) => b.score - a.score);

  const topMatches = allMatches.slice(0, 3);
  const best = topMatches[0];
  const predictionStatus = predictionStatusForScore(best.score);
  const predictedCompany =
    predictionStatus === "low_confidence"
      ? null
      : {
          id: best.company_id,
          name: best.company_name,
        };

  logger.info(
    {
      scores: allMatches.map((match) => ({
        companyId: match.company_id,
        companyName: match.company_name,
        score: Number(match.score.toFixed(4)),
      })),
      selected: predictedCompany,
      predictionStatus,
    },
    "Recognition similarity scores computed",
  );

  return {
    status: "success",
    prediction_status: predictionStatus,
    predicted_company: predictedCompany,
    similarity_score: best.score,
    similarity_percentage: scoreToPercentage(best.score),
    top_matches: topMatches,
    message: messageForStatus(predictionStatus),
    embedding,
    embedding_json: serializeEmbedding(embedding),
    embedding_model: EMBEDDING_MODEL,
    embedding_dimension: EMBEDDING_DIM,
  };
}
