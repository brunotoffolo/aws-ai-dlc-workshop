import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import type { ReactNode } from "react";

export function RoleGuard({ children, role }: { children: ReactNode; role: string }) {
  const { user } = useAuth();
  if (user && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}
