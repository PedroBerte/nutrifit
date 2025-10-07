import { useValidateSession } from "@/services/api/auth";
import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { BounceLoader } from "react-spinners";
import { decodeAndNormalizeJwt } from "@/lib/jwt";
import { signInFromJwt } from "@/store/authSlice";
import { UserProfiles } from "@/types/user";

export default function Callback() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mutateAsync, isPending } = useValidateSession();

  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      navigate("/login?err=missing-token", { replace: true });
      return;
    }
    validateToken(token);
  }, []);

  async function validateToken(token: string) {
    try {
      const jwt = await mutateAsync(token);

      const decoded = decodeAndNormalizeJwt(jwt);
      const ok =
        !!decoded?.id &&
        !!decoded?.email &&
        typeof decoded?.expMs === "number" &&
        decoded.expMs > Date.now();

      if (!ok) {
        navigate("/login?err=invalid-link", { replace: true });
        return;
      }

      dispatch(signInFromJwt({ accessToken: jwt }));

      if (decoded.profile) {
        navigate("/home", { replace: true });
      } else {
        navigate("/first-access?token=" + token, { replace: true });
      }
    } catch (err) {
      navigate("/login?err=invalid-link", { replace: true });
    }
  }

  return (
    <div className="flex flex-col gap-5 items-center justify-center flex-1">
      <p className="text-sm text-neutral-white-02">Validando acesso…</p>
      <BounceLoader color="#21A15D" />
    </div>
  );
}
