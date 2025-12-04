import { ChevronLeft, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "./ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfiles } from "@/types/user";
import { getParentRoute } from "@/lib/navigation";
import { useGetBondAsCustomer } from "@/services/api/bond";

type NavbarProps = {
  isMenuButtonVisible?: boolean;
};

export default function Navbar({ isMenuButtonVisible = true }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: activeBond } = useGetBondAsCustomer();

  const isOnHome =
    (user?.profile === UserProfiles.PERSONAL &&
      location.pathname === "/personal") ||
    (user?.profile === UserProfiles.STUDENT &&
      location.pathname === "/workout");

  const { toggleSidebar, setOpenMobile } = useSidebar();

  const onMenuClick = () => {
    toggleSidebar();
  };

  const handleBackClick = () => {
    setOpenMobile(false); // Garante que a sidebar feche ao voltar

    // Se estiver na página de um profissional e tiver vínculo ativo, voltar para myProfessionals
    const isProfessionalPage = /^\/professional\/[^/]+$/.test(
      location.pathname
    );
    if (isProfessionalPage && activeBond?.status === "A") {
      navigate("/myProfessionals");
      return;
    }

    const parentRoute = getParentRoute(location.pathname, user?.profile);
    navigate(parentRoute);
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
