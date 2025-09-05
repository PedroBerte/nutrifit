import { Routes, Route } from "react-router-dom";
import App from "@/App";
import { PrivateRoute } from "./PrivateRoute";
import Login from "@/pages/Login";
import Callback from "@/pages/CallbackLogin";
import Home from "@/pages/Home";
import ChooseAccount from "@/pages/ChooseAccount";
import GenericFirstRegister from "@/pages/GenericFirstRegister";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="login" element={<Login />} />
        <Route path="login/callback" element={<Callback />} />

        <Route element={<PrivateRoute />}>
          <Route path="home" element={<Home />} />
          <Route path="choose-account" element={<ChooseAccount />} />
          <Route path="first-access" element={<GenericFirstRegister />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Route>
    </Routes>
  );
}
