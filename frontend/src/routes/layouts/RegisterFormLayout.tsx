import { RegisterFormProvider } from "@/contexts/forms/RegisterFormContext";
import React from "react";
import { Outlet } from "react-router-dom";

export default function RegisterFormContextLayout() {
  return (
    <RegisterFormProvider>
      <Outlet />
    </RegisterFormProvider>
  );
}
