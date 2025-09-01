// src/features/auth/AuthProvider.tsx
import { useMe } from "@/services/api/auth";
import { createContext, useContext, type ReactNode } from "react";

type AuthContextType = {
  me: { email: string } | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ me: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useMe();
  return (
    <AuthContext.Provider value={{ me: data ?? null, loading: isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
