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

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {!isOnHome && (
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar para o início"
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
