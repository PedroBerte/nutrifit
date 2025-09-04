// src/routes/PrivateRoute.tsx
import { useSelector } from "react-redux";
import { type RootState } from "@/store";
import { Navigate, Outlet } from "react-router-dom";

export function PrivateRoute() {
  const isAuth = useSelector((s: RootState) => !!s.auth.accessToken);
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}
