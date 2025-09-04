// src/pages/login/Callback.tsx
import { useValidateSession } from "@/services/api/auth";
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signIn } from "@/store/authSlice";
import { jwtDecode } from "jwt-decode";
import type { JwtType } from "@/types/JwtTypes";

export default function Callback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const validate = useValidateSession();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      navigate("/login");
      return;
    }

    validate.mutate(token, {
      onSuccess: (data) => {
        const decoded = jwtDecode<JwtType>(data);
        dispatch(
          signIn({
            accessToken: data,
            refreshToken: data,
            expiresIn: decoded.exp
              ? decoded.exp - Math.floor(Date.now() / 1000)
              : 3600,
            tokenType: "Bearer",
            user: { email: decoded["email"] },
          })
        );
        navigate("/home", { replace: true });
      },
      onError: () => {
        navigate("/login?erro=token");
      },
    });
  }, [params, navigate]);

  return (
    <div className="flex items-center justify-center h-[70vh]">
      <p className="text-sm">Validando acesso…</p>
    </div>
  );
}
