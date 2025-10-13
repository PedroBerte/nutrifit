import { Routes, Route, Navigate } from "react-router-dom";
import App from "@/App";
import { PrivateRoute } from "./PrivateRoute";
import Login from "@/pages/login/Login";
import Callback from "@/pages/login/CallbackLogin";
import Home from "@/pages/Home";
import AppDefaultLayout from "./layouts/AppDefaultLayout";
import RegisterFormLayout from "./layouts/RegisterFormLayout";
import FirstAccess from "@/pages/FirstAccess";
import Profile from "@/pages/Profile";
import Professional from "@/pages/Professional";
import Workout from "@/pages/Workout";
import Students from "@/pages/Students";
import Diet from "@/pages/Diet";
import Bond from "@/pages/Bond";

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
          <Route element={<AppDefaultLayout />}>
            <Route path="home" element={<Home />} />
            <Route path="workout" element={<Workout />} />
            <Route path="profile" element={<Profile />} />
            <Route path="professional/:id" element={<Professional />} />
            <Route path="students" element={<Students />} />
            <Route path="diet" element={<Diet />} />
            <Route path="bond" element={<Bond />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
