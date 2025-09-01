import { useAuth } from "@/contexts/AuthContext";
import type { JSX } from "react";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { me, loading } = useAuth();

  if (loading) return <div className="p-6 text-sm">Carregando…</div>;
  if (!me) return <Navigate to="/login" replace />;

  return children;
}
