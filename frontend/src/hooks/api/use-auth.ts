import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

interface RegisterPayload { email: string; password: string; role?: string }
interface LoginPayload { email: string; password: string }
interface VerifyPayload { email: string; code: string }
interface UpdateProfilePayload { experience_level?: string; learning_goals?: string[]; technical_role?: boolean }

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterPayload) => api.post("/auth/register", data).then((r) => r.data),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginPayload) => api.post("/auth/login", data).then((r) => r.data),
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.data.access_token);
      if (data.data.refresh_token) localStorage.setItem("refresh_token", data.data.refresh_token);
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (data: VerifyPayload) => api.post("/auth/verify", data).then((r) => r.data),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get("/auth/profile").then((r) => r.data),
    enabled: !!localStorage.getItem("access_token"),
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => api.put("/auth/profile", data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}
