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
  images: LogoImageDto[];
};

export type RecognizeDemoResponse = {
  id: number;
  status: "Demo Mode";
  message: string;
  uploaded_image_path: string;
  original_name: string;
  similarity_score: number | null;
  predicted_company: string | null;
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

export async function recognizeDemo(file: File): Promise<RecognizeDemoResponse> {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch(`${API_BASE}/recognize/demo`, {
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
