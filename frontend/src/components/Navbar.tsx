import { ChevronLeft, Menu } from "lucide-react";
import {
  unstable_RouterContextProvider,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useSidebar } from "./ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfiles } from "@/types/user";

type NavbarProps = {
  isMenuButtonVisible?: boolean;
};

// Mapa de navegação: define para onde cada rota deve voltar
const getBackRoute = (currentPath: string, profileId?: string): string => {
  // Rotas de workout
  if (currentPath.startsWith("/workout/session/")) return "/workout";

  // Rotas de rotinas
  if (currentPath.match(/^\/routines\/[^/]+\/workouts\/(new|[^/]+)$/)) {
    const routineId = currentPath.split("/")[2];
    return `/routines/${routineId}`;
  }
  if (currentPath.match(/^\/routines\/[^/]+$/)) return "/routines";
  if (currentPath === "/routines/new") return "/routines";

  // Rotas de profissional
  if (currentPath.match(/^\/professional\/[^/]+$/)) return "/professionalsList";

  // Home padrão baseado no perfil
  const homeRoute =
    profileId === UserProfiles.PERSONAL ? "/personal" : "/workout";

  // Rotas gerais voltam para home
  return homeRoute;
};

export default function Navbar({ isMenuButtonVisible = true }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOnHome =
    (user?.profile === UserProfiles.PERSONAL &&
      location.pathname === "/personal") ||
    (user?.profile === UserProfiles.STUDENT &&
      location.pathname === "/workout");

  const { toggleSidebar } = useSidebar();

  const onMenuClick = () => {
    toggleSidebar();
  };

  const handleBackClick = () => {
    const backRoute = getBackRoute(
      location.pathname,
      user?.profile ?? undefined
    );
    navigate(backRoute);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {!isOnHome && (
          <button
            onClick={handleBackClick}
            aria-label="Voltar"
            className="mr-1 rounded hover:bg-white/10"
          >
            <ChevronLeft size={32} color="white" />
          </button>
        )}

        <div className="flex">
          <p className="text-3xl text-neutral-white-01 font-bold">Nutri</p>
          <p className="text-3xl text-primary font-bold">Fit</p>
        </div>
      </div>

      {isMenuButtonVisible && (
        <div>
          <Menu onClick={onMenuClick} size={28} color="white" />
        </div>
      )}
    </div>
  );
}
