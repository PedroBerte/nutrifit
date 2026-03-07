import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function AdminGuard({
  children,
  redirectTo = "/home",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
