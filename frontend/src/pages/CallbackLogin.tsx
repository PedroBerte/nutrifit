import { useValidateSession } from "@/services/api/auth";
import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signIn, signInFromJwt } from "@/store/authSlice";
import { decodeAndNormalizeJwt } from "@/lib/jwt";

export default function Callback() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mutateAsync, isPending } = useValidateSession();
  const inFlightRef = useRef(false);

  useEffect(() => {
    const linkToken = sp.get("token");
    if (!linkToken) {
      navigate("/login?err=missing-token", { replace: true });
      return;
    }

    const fuseKey = `callback.validate:${linkToken}`;
    if (sessionStorage.getItem(fuseKey) === "1" || inFlightRef.current) return;
    sessionStorage.setItem(fuseKey, "1");
    inFlightRef.current = true;

    (async () => {
      try {
        const jwt = await mutateAsync(linkToken);

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

        if (decoded.roles && decoded.roles.length > 1) {
          navigate("/home", { replace: true });
        } else {
          navigate("/choose-account", { replace: true });
        }
      } catch (err) {
        sessionStorage.removeItem(fuseKey);
        inFlightRef.current = false;
        navigate("/login?err=invalid-link", { replace: true });
      }
    })();
  }, [sp, mutateAsync, dispatch, navigate]);

  return (
    <div className="flex items-center justify-center h-[70vh]">
      <p className="text-sm">Validando acesso…</p>
    </div>
  );
}
