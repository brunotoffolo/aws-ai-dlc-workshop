import axios from "axios";
import { env } from "@/config/env";

export const api = axios.create({ baseURL: env.apiUrl });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("id_token") || localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    // Wrap response data so frontend can access it as res.data.data
    if (res.data && typeof res.data === "object" && !("data" in res.data)) {
      res.data = { data: res.data };
    }
    return res;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("id_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
