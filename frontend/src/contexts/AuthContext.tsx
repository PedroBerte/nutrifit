// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState } from "@/store";
import { signOut } from "@/store/authSlice";
import { decodeAndNormalizeJwt, type DecodedJwt } from "@/lib/jwt";

type AuthUser = {
  token: string | null;
  tokenType: string | null;
  user: DecodedJwt | null;
  isExpired: boolean;
  secondsLeft: number | null;
  hasRole: (role: string) => boolean;
  isAdmin: boolean;
  logout: () => void;
};

const Ctx = createContext<AuthUser | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { accessToken, tokenType, expiresAt } = useSelector(
    (s: RootState) => s.auth
  );

  const decoded = useMemo<DecodedJwt | null>(
    () => decodeAndNormalizeJwt(accessToken),
    [accessToken]
  );

  const { isExpired, secondsLeft } = useMemo(() => {
    if (!expiresAt) return { isExpired: true, secondsLeft: null };
    const msLeft = expiresAt - Date.now();
    return {
      isExpired: msLeft <= 0,
      secondsLeft: Math.max(Math.floor(msLeft / 1000), 0),
    };
  }, [expiresAt]);

  const hasRole = useCallback(
    (role: string) =>
      !!decoded?.roles?.some((r) => r.toLowerCase() === role.toLowerCase()),
    [decoded?.roles]
  );

  const logout = useCallback(() => {
    dispatch(signOut());
  }, [dispatch]);

  const value = useMemo<AuthUser>(
    () => ({
      token: accessToken,
      tokenType: tokenType ?? "Bearer",
      user: decoded,
      isExpired,
      secondsLeft,
      hasRole,
      isAdmin: !!decoded?.isAdmin,
      logout,
    }),
    [accessToken, tokenType, decoded, isExpired, secondsLeft, hasRole, logout]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
