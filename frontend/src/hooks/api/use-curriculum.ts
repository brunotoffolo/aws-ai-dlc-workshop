import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

interface GeneratePayload { topic: string; test_type: string; program_level: string }
interface AssignPayload { curriculum_id: string; learner_ids: string[]; deadline?: string }

export function useGenerateCurriculum() {
  return useMutation({
    mutationFn: (data: GeneratePayload) => api.post("/curricula/generate", data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["curricula"] }),
  });
}

export function useCurricula() {
  return useQuery({
    queryKey: ["curricula"],
    queryFn: () => api.get("/curricula").then((r) => r.data),
  });
}

export function useCurriculum(id: string) {
  return useQuery({
    queryKey: ["curricula", id],
    queryFn: () => api.get(`/curricula/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCurriculumStatus(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ["curricula", id, "status"],
    queryFn: () => api.get(`/curricula/${id}/status`).then((r) => r.data),
    enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      return status === "RUNNING" ? 3000 : false;
    },
  });
}

export function useWizardCategories() {
  return useQuery({
    queryKey: ["wizard-categories"],
    queryFn: () => api.get("/curricula/wizard/categories").then((r) => r.data),
    staleTime: 300_000,
  });
}

export function useAssignCurriculum() {
  return useMutation({
    mutationFn: (data: AssignPayload) => api.post("/curricula/assign", data).then((r) => r.data),
  });
}
