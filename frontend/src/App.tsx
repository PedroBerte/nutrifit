import { Outlet } from "react-router-dom";
import { SidebarProvider } from "./components/ui/sidebar";
import { ToastProvider } from "./contexts/ToastContext";
import { ToastContainer } from "./components/ToastContainer";
import { UpdateNotification } from "./components/UpdateNotification";
import { usePwaUpdate } from "./hooks/usePwaUpdate";

function App() {
  const { needRefresh, doUpdate, dismiss } = usePwaUpdate();

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-neutral-dark-01 px-4 py-4">
        <SidebarProvider>
          <Outlet />
        </SidebarProvider>
      </div>
      <ToastContainer />
      <UpdateNotification
        isOpen={needRefresh}
        onUpdate={doUpdate}
        onDismiss={dismiss}
      />
    </ToastProvider>
  );
}

export default App;
