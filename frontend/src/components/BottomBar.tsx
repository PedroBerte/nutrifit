import { Apple, CircleUser, Dumbbell, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBottomBarVisibility } from "@/hooks/useBottomBarVisibility";

export default function BottomBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { showBottomBar } = useBottomBarVisibility();

  if (!showBottomBar) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[calc(env(safe-area-inset-bottom)+1rem)]"
      aria-label="Navegação principal"
    >
      {/* <div className="flex w-1/4 max-w-md mx-auto items-center justify-between bg-neutral-dark-02/90 backdrop-blur rounded-4xl px-4 py-2 shadow-lg"> */}
      <div className="flex gap-2 max-w-md mx-auto items-center justify-between bg-neutral-dark-02/90 backdrop-blur rounded-4xl px-4 py-2 shadow-lg">
        <button
          onClick={() => navigate("/workout")}
          className={`flex flex-col items-center justify-center p-3 rounded-full transition-all ${
            pathname === "/workout"
              ? "bg-secondary text-primary"
              : "text-neutral-light-01"
          }`}
          aria-label="Página inicial"
        >
          <Dumbbell size={32} />
        </button>

        {/* <button
          onClick={() => navigate("/diet")}
          className={`flex flex-col items-center justify-center p-3 rounded-full transition-all ${
            pathname.startsWith("/diet")
              ? "bg-secondary text-primary"
              : "text-neutral-light-01"
          }`}
          aria-label="Nutrição"
        >
          <Apple size={32} />
        </button> */}

        <button
          onClick={() => navigate("/profile")}
          className={`flex flex-col items-center justify-center p-3 rounded-full transition-all ${
            pathname.startsWith("/profile")
              ? "bg-secondary text-primary"
              : "text-neutral-light-01"
          }`}
          aria-label="Perfil"
        >
          <CircleUser size={32} />
        </button>
      </div>
    </nav>
  );
}
