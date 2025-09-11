import { Routes, Route, Navigate } from "react-router-dom";
import App from "@/App";
import { PrivateRoute } from "./PrivateRoute";
import Login from "@/pages/login/Login";
import Callback from "@/pages/login/CallbackLogin";
import Home from "@/pages/Home";
import AppLayoutWithNavbar from "./layouts/AppLayoutWithNavbar";
import RegisterFormLayout from "./layouts/RegisterFormLayout";
import FirstAccess from "@/pages/FirstAccess";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Navigate to="home" replace />} />

        <Route path="login" element={<Login />} />
        <Route path="login/callback" element={<Callback />} />

        <Route element={<RegisterFormLayout />}>
          <Route path="first-access" element={<FirstAccess />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayoutWithNavbar />}>
            <Route path="home" element={<Home />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
