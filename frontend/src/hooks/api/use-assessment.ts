import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface Answer { question_id: string; answer: string }

export function useQuiz(curriculumId: string, quizId: string) {
  return useQuery({
    queryKey: ["quiz", curriculumId, quizId],
    queryFn: () => api.get(`/quizzes/${curriculumId}/${quizId}`).then((r) => r.data),
    enabled: !!curriculumId && !!quizId,
  });
}

export function useSubmitAnswers() {
  return useMutation({
    mutationFn: ({ curriculumId, quizId, answers }: { curriculumId: string; quizId: string; answers: Answer[] }) =>
      api.post(`/quizzes/${curriculumId}/${quizId}/submit`, { answers }).then((r) => r.data),
  });
}

export function usePreAssessment(curriculumId: string) {
  return useQuery({
    queryKey: ["pre-assessment", curriculumId],
    queryFn: () => api.get(`/curricula/${curriculumId}/pre-assessment`).then((r) => r.data),
    enabled: !!curriculumId,
  });
}

export function useSubmitPreAssessment() {
  return useMutation({
    mutationFn: ({ curriculumId, answers }: { curriculumId: string; answers: Answer[] }) =>
      api.post(`/curricula/${curriculumId}/pre-assessment/submit`, { answers }).then((r) => r.data),
  });
}
