import { RegisterFormProvider } from "@/contexts/forms/RegisterFormContext";
import { Outlet } from "react-router-dom";

export default function RegisterFormLayout() {
  return (
    <RegisterFormProvider>
      <Outlet />
    </RegisterFormProvider>
  );
}
