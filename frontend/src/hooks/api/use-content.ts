import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useLesson(curriculumId: string, lessonId: string) {
  return useQuery({
    queryKey: ["content", curriculumId, lessonId],
    queryFn: () => api.get(`/content/${curriculumId}/${lessonId}`).then((r) => r.data),
    enabled: !!curriculumId && !!lessonId,
  });
}

export function useReviewQueue() {
  return useQuery({
    queryKey: ["review-queue"],
    queryFn: () => api.get("/content/review-queue").then((r) => r.data),
  });
}

export function useReviewContent() {
  return useMutation({
    mutationFn: ({ curriculumId, lessonId, action, feedback, edited_content }: {
      curriculumId: string; lessonId: string; action: string; feedback?: string; edited_content?: string;
    }) => api.post(`/content/${curriculumId}/${lessonId}/review`, { action, feedback, edited_content }).then((r) => r.data),
  });
}

export function useApproveAllContent() {
  return useMutation({
    mutationFn: (curriculumId: string) => api.post(`/content/${curriculumId}/approve-all`).then((r) => r.data),
  });
}
