// src/pages/login/Callback.tsx
import { useValidateSession } from "@/services/api/auth";
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Callback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const validate = useValidateSession();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      navigate("/login");
      return;
    }

    validate.mutate(token, {
      onSuccess: () => navigate("/app"),
      onError: () => navigate("/login?erro=token"),
    });
  }, []);

  return (
    <div className="w-full h-[70vh] flex items-center justify-center">
      <p className="text-sm">validando acesso…</p>
    </div>
  );
}
