import { Company } from "../store/companies";

// Stub API endpoints ready to be connected to FastAPI
export async function addCompanyApi(name: string, files: File[]): Promise<Company> {
  console.log("TODO: connect to FastAPI backend - POST /api/companies", { name, files });
  // Mock return value, frontend will handle actual state for Phase 1
  return {
    id: crypto.randomUUID(),
    name,
    images: [],
    createdAt: Date.now()
  };
}

export async function listCompaniesApi(): Promise<Company[]> {
  console.log("TODO: connect to FastAPI backend - GET /api/companies");
  return [];
}

export async function recognizeLogoApi(file: File): Promise<{ companyName: string; confidence: number } | null> {
  console.log("TODO: connect to FastAPI backend - POST /api/recognize", file);
  return { companyName: "Unknown", confidence: 0.0 };
}
