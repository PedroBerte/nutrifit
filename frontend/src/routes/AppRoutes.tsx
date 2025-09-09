import { Routes, Route, Navigate } from "react-router-dom";
import App from "@/App";
import { PrivateRoute } from "./PrivateRoute";
import Login from "@/pages/login/Login";
import Callback from "@/pages/login/CallbackLogin";
import Home from "@/pages/Home";
import ChooseAccount from "@/pages/register/ChooseAccount";
import GenericFirstRegister from "@/pages/register/GenericFirstRegister";
import ProfessionalRegister from "@/pages/register/AddressRegister";
import RegisterFormLayout from "./layouts/RegisterFormLayout";
import Quiz from "@/pages/register/Quiz";
import AddressRegister from "@/pages/register/AddressRegister";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Navigate to="home" replace />} />

        <Route path="login" element={<Login />} />
        <Route path="login/callback" element={<Callback />} />

        <Route element={<PrivateRoute />}>
          <Route element={<RegisterFormLayout />}>
            <Route path="choose-account" element={<ChooseAccount />} />
            <Route path="first-access" element={<GenericFirstRegister />} />
            <Route
              path="professional-register"
              element={<ProfessionalRegister />}
            />
            <Route path="address-register" element={<AddressRegister />} />
            <Route path="quiz" element={<Quiz />} />
          </Route>

          <Route path="home" element={<Home />} />
        </Route>
      </Route>
    </Routes>
  );
}
