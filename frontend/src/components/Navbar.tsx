import { Menu } from "lucide-react";

type NavbarProps = {
  onMenuClick?: () => void;
  isMenuButtonVisible?: boolean;
};

export default function Navbar({
  onMenuClick,
  isMenuButtonVisible = true,
}: NavbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex">
        <p className="text-3xl text-neutral-white-01 font-bold">Nutri</p>
        <p className="text-3xl text-primary font-bold">Fit</p>
      </div>

      {isMenuButtonVisible && (
        <Menu onClick={onMenuClick} size={28} color="white" />
      )}
    </div>
  );
}
