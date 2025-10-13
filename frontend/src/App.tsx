import { Outlet } from "react-router-dom";
import { SidebarProvider } from "./components/ui/sidebar";

function App() {
  return (
    <div className="flex min-h-screen bg-neutral-dark-01 px-4 py-4">
      <SidebarProvider>
        <Outlet />
      </SidebarProvider>
    </div>
  );
}

export default App;
