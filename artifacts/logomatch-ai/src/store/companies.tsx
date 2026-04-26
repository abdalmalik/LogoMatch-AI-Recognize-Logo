// React Query–based hooks for the companies + recognition data.
// The previous in-memory store has been replaced by the live backend.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listCompanies,
  createCompany,
  deleteCompany,
  recognizeDemo,
  fetchRecognitionTestCount,
  type CompanyDto,
  type RecognizeDemoResponse,
} from "@/services/api";

export const queryKeys = {
  companies: ["companies"] as const,
  recognitionCount: ["recognition-count"] as const,
};

export function useCompaniesQuery() {
  return useQuery<CompanyDto[]>({
    queryKey: queryKeys.companies,
    queryFn: listCompanies,
  });
}

export function useRecognitionCountQuery() {
  return useQuery<number>({
    queryKey: queryKeys.recognitionCount,
    queryFn: fetchRecognitionTestCount,
  });
}

export function useCreateCompanyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
}

export function useDeleteCompanyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCompany(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
}

export function useRecognizeDemoMutation() {
  const qc = useQueryClient();
  return useMutation<RecognizeDemoResponse, Error, File>({
    mutationFn: (file: File) => recognizeDemo(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.recognitionCount });
    },
  });
}
