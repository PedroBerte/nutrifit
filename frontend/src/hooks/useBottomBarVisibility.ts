import { useLocation } from "react-router-dom";

const HIDDEN_ROUTES = ["/login", "/login/callback", "/first-access"];

export function useBottomBarVisibility() {
  const { pathname } = useLocation();

  const isHidden = HIDDEN_ROUTES.some((r) => pathname.startsWith(r));

  return { showBottomBar: !isHidden };
}

export default useBottomBarVisibility;
