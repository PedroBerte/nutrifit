import { useAuth } from "@/contexts/AuthContext";
import { UserProfiles } from "@/types/user";
import { useLocation } from "react-router-dom";

const HIDDEN_ROUTES = [
  "/login",
  "/login/callback",
  "/first-access",
  "/workout/session",
];

export function useBottomBarVisibility() {
  const { pathname } = useLocation();

  const { user } = useAuth();

  const isHidden =
    HIDDEN_ROUTES.some((r) => pathname.startsWith(r)) ||
    (user && user.profile == UserProfiles.PERSONAL);

  return { showBottomBar: !isHidden };
}

export default useBottomBarVisibility;
