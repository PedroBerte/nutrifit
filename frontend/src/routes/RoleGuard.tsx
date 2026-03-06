import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfiles } from "@/types/user";
import { useGetUserById } from "@/services/api/user";

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
  const { data: userData, isLoading } = useGetUserById(user?.id);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="py-8 text-center text-neutral-white-03">
        Carregando...
      </div>
    );
  }

  // Prefer DB value (fresh) over JWT value (stale after profile change)
  const userProfile = (userData?.profile?.id ?? user.profile) as UserProfiles;

  if (!allowedProfiles.includes(userProfile)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
