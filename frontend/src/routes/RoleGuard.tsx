import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfiles } from "@/types/user";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedProfiles: UserProfiles[];
  redirectTo?: string;
}

export function RoleGuard({
  children,
  allowedProfiles,
  redirectTo = "/home",
}: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userProfile = user.profile as UserProfiles;

  if (!allowedProfiles.includes(userProfile)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
