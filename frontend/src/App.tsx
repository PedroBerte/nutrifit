import { Outlet } from "react-router-dom";
import { SidebarProvider } from "./components/ui/sidebar";
import { ToastProvider } from "./contexts/ToastContext";
import { ToastContainer } from "./components/ToastContainer";
import { ActiveWorkoutProvider } from "./contexts/ActiveWorkoutContext";

function App() {
  return (
    <ToastProvider>
      <ActiveWorkoutProvider>
        <div className="flex min-h-screen bg-neutral-dark-01 px-4 py-4">
          <SidebarProvider>
            <Outlet />
          </SidebarProvider>
        </div>
        <ToastContainer />
      </ActiveWorkoutProvider>
    </ToastProvider>
  );
}

export default App;
