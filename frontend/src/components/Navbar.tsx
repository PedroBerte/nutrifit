import { ChevronLeft, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "./ui/sidebar";

type NavbarProps = {
  isMenuButtonVisible?: boolean;
};

export default function Navbar({ isMenuButtonVisible = true }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnHome = location.pathname.includes("/home");

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
            aria-label="Voltar para home"
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
