// src/routes/layouts/AppDefaultLayout.tsx
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
    <SidebarProvider defaultOpen={false} className="h-dvh overflow-hidden">
      {/* SidebarProvider renders as flex-row — AppSidebar (right) + content column */}
      <div className="flex flex-col flex-1 min-w-0 h-dvh overflow-hidden bg-neutral-dark-01">
        <header className="shrink-0 sticky top-0 z-40 bg-neutral-dark-01 px-4 py-3 border-b border-border/5">
          <Navbar isMenuButtonVisible={isMenuButtonVisible} />
        </header>
        <main className="flex-1 overflow-y-auto px-4 pb-8 md:px-6">
          <Outlet />
        </main>
        <BottomBar />
      </div>
      <AppSidebar />
    </SidebarProvider>
  );
}
