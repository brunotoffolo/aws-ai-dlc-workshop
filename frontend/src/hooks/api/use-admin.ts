import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useLearnerOverview(curriculumId?: string) {
  return useQuery({
    queryKey: ["admin", "learners", curriculumId],
    queryFn: () => api.get("/admin/learners", { params: curriculumId ? { curriculum_id: curriculumId } : undefined }).then((r) => r.data),
  });
}

export function useCourseCatalog() {
  return useQuery({
    queryKey: ["admin", "courses"],
    queryFn: () => api.get("/admin/courses").then((r) => r.data),
  });
}

export function useReviewBacklog() {
  return useQuery({
    queryKey: ["admin", "review-backlog"],
    queryFn: () => api.get("/admin/review-backlog").then((r) => r.data),
  });
}
