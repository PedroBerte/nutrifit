// src/routes/layouts/AppLayoutWithNav.tsx
import Navbar from "@/components/Navbar";
import BottomBar from "@/components/BottomBar";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toast } from "@/components/Toast";

type AppLayoutWithNavbarProps = {
  isMenuButtonVisible?: boolean;
};

export default function AppDefaultLayout({
  isMenuButtonVisible,
}: AppLayoutWithNavbarProps) {
  return (
    <div className="flex flex-col w-full bg-neutral-dark-01">
      <AppSidebar />
      <Navbar isMenuButtonVisible={isMenuButtonVisible} />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomBar />
    </div>
  );
}
