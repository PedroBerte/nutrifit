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
  const { data: userData, isLoading: isLoadingUserData } = useGetUserById(
    user?.id
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoadingUserData) {
    return null;
  }

  const serverProfile = userData?.profileId as UserProfiles | undefined;
  const userProfile = (serverProfile ?? user.profile) as UserProfiles;

  const rawProfileValue =
    typeof user.raw?.profile === "string" ? user.raw.profile.toLowerCase() : "";
  const isSelfManagedUser =
    userProfile === UserProfiles.SELF_MANAGED || rawProfileValue === "selfmanaged";

  const selfManagedHasAccess =
    isSelfManagedUser &&
    (allowedProfiles.includes(UserProfiles.STUDENT) ||
      allowedProfiles.includes(UserProfiles.PERSONAL));

  if (!allowedProfiles.includes(userProfile) && !selfManagedHasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
