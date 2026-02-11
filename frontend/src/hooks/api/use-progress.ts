import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export function useProgress(curriculumId: string) {
  return useQuery({
    queryKey: ["progress", curriculumId],
    queryFn: () => api.get(`/progress/${curriculumId}`).then((r) => r.data),
    enabled: !!curriculumId,
  });
}

export function useCompleteLesson() {
  return useMutation({
    mutationFn: ({ curriculumId, lessonId }: { curriculumId: string; lessonId: string }) =>
      api.post(`/progress/${curriculumId}/lessons/${lessonId}/complete`).then((r) => r.data),
    onSuccess: (_, { curriculumId }) => queryClient.invalidateQueries({ queryKey: ["progress", curriculumId] }),
  });
}

export function useSaveResume() {
  return useMutation({
    mutationFn: ({ curriculumId, state }: { curriculumId: string; state: Record<string, unknown> }) =>
      api.put(`/progress/${curriculumId}/resume`, state).then((r) => r.data),
  });
}

export function useResume(curriculumId: string) {
  return useQuery({
    queryKey: ["resume", curriculumId],
    queryFn: () => api.get(`/progress/${curriculumId}/resume`).then((r) => r.data),
    enabled: !!curriculumId,
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/progress/dashboard").then((r) => r.data),
  });
}
