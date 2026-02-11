import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useProfile } from "@/hooks/api/use-auth";

interface User { user_id: string; email: string; role: string; [key: string]: unknown }

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, isLoading: true, isAuthenticated: false, logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const { data, isLoading } = useProfile();

  const user = token && data?.data ? (data.data as User) : null;

  useEffect(() => {
    const handler = () => setToken(localStorage.getItem("access_token"));
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: !!token && isLoading, isAuthenticated: !!user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
