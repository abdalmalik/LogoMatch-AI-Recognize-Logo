// Backend API client for the LogoMatch AI Express server.
// All endpoints live under `/api` (proxied to the api-server artifact).

export type LogoImageDto = {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export type CompanyDto = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  prototypeReady: boolean;
  prototypeModel: string | null;
  prototypeCreatedAt: string | null;
  images: LogoImageDto[];
};

export type TopMatchDto = {
  company_id: number;
  company_name: string;
  score: number;
  percentage: number;
};

export type PredictionStatus =
  | "high_confidence"
  | "medium_confidence"
  | "low_confidence"
  | "unknown";

export type PredictedCompanyDto = {
  id: number;
  name: string;
};

export type RecognizeDemoResponse = {
  id: number;
  status: "success";
  prediction_status: PredictionStatus;
  message: string;
  uploaded_image_path: string;
  original_name: string;
  similarity_score: number | null;
  similarity_percentage: number | null;
  predicted_company: PredictedCompanyDto | null;
  top_matches: TopMatchDto[];
  embedding_model?: string;
  embedding_dimension?: number;
};

export type EvaluationSummaryDto = {
  total: number;
  correct: number;
  incorrect: number;
  accuracy_percentage: number;
};

export type EvaluationResponseDto = {
  id: number;
  expected_company: PredictedCompanyDto;
  correct: boolean;
  uploaded_image_path: string;
  result: Omit<RecognizeDemoResponse, "id" | "uploaded_image_path" | "original_name">;
  summary: EvaluationSummaryDto;
};

const API_BASE = "/api";

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (data && typeof data.error === "string") return data.error;
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status})`;
}

export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function listCompanies(): Promise<CompanyDto[]> {
  const res = await fetch(`${API_BASE}/companies`);
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { companies: CompanyDto[] };
  return data.companies;
}

export async function getCompany(id: number): Promise<CompanyDto> {
  const res = await fetch(`${API_BASE}/companies/${id}`);
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { company: CompanyDto };
  return data.company;
}

export async function createCompany(input: {
  name: string;
  description: string;
  images: File[];
}): Promise<CompanyDto> {
  const fd = new FormData();
  fd.append("name", input.name);
  if (input.description) fd.append("description", input.description);
  for (const img of input.images) fd.append("images", img);

  const res = await fetch(`${API_BASE}/companies`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { company: CompanyDto };
  return data.company;
}

export async function deleteCompany(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/companies/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function regenerateCompanyPrototype(id: number): Promise<CompanyDto> {
  const res = await fetch(`${API_BASE}/companies/${id}/prototype`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { company: CompanyDto };
  return data.company;
}

export async function regenerateAllPrototypes(): Promise<{ regenerated: number; failed?: number }> {
  const res = await fetch(`${API_BASE}/companies/prototypes/regenerate`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function recognizeDemo(file: File): Promise<RecognizeDemoResponse> {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch(`${API_BASE}/recognize`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function fetchRecognitionTestCount(): Promise<number> {
  const res = await fetch(`${API_BASE}/recognize/tests`);
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { count: number };
  return data.count;
}

export async function fetchEvaluationSummary(): Promise<EvaluationSummaryDto> {
  const res = await fetch(`${API_BASE}/evaluations/summary`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function evaluateLogo(input: {
  expectedCompanyId: number;
  image: File;
}): Promise<EvaluationResponseDto> {
  const fd = new FormData();
  fd.append("expectedCompanyId", String(input.expectedCompanyId));
  fd.append("image", input.image);

  const res = await fetch(`${API_BASE}/evaluations`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
