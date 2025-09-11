// src/routes/layouts/AppLayoutWithNav.tsx
import Navbar from "@/components/Navbar";
import { Outlet } from "react-router-dom";

type AppLayoutWithNavbarProps = {
  isMenuButtonVisible?: boolean;
};

export default function AppLayoutWithNavbar({
  isMenuButtonVisible,
}: AppLayoutWithNavbarProps) {
  return (
    <div className="flex flex-1 flex-col bg-neutral-dark-01">
      <Navbar isMenuButtonVisible={isMenuButtonVisible} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
