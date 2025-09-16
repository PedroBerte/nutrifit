import BottomBar from "@/components/BottomBar";
import React from "react";
import { Outlet } from "react-router-dom";
import { useBottomBarVisibility } from "@/hooks/useBottomBarVisibility";

export default function AppLayoutWithBottomBar() {
  const { showBottomBar } = useBottomBarVisibility();

  return (
    <div className="flex min-h-screen h-dvh flex-col bg-neutral-dark-01">
      <main
        className={`flex-1 overflow-y-auto px-0 ${
          showBottomBar ? "pb-28" : ""
        }`}
      >
        <Outlet />
      </main>
      {showBottomBar && <BottomBar />}
    </div>
  );
}
