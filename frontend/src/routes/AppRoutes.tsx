import { Routes, Route } from "react-router-dom";
import App from "@/App";
import { PrivateRoute } from "./PrivateRoute";
import Login from "@/pages/Login";
import Callback from "@/pages/CallbackLogin";
import Home from "@/pages/Home";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="login" element={<Login />} />
        <Route path="login/callback" element={<Callback />} />

        <Route element={<PrivateRoute />}>
          <Route path="home" element={<Home />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Route>
    </Routes>
  );
}
