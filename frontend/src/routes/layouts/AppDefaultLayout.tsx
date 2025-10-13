// src/routes/layouts/AppLayoutWithNav.tsx
import Navbar from "@/components/Navbar";
import BottomBar from "@/components/BottomBar";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

type AppLayoutWithNavbarProps = {
  isMenuButtonVisible?: boolean;
};

export default function AppDefaultLayout({
  isMenuButtonVisible,
}: AppLayoutWithNavbarProps) {
  return (
    <div className="flex flex-1 flex-col bg-neutral-dark-01">
      <AppSidebar />
      <Navbar isMenuButtonVisible={isMenuButtonVisible} />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomBar />
    </div>
  );
}
