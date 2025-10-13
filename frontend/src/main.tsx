import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { registerSW } from "virtual:pwa-register";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store/index.ts";
import { Provider } from "react-redux";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { AppRoutes } from "./routes/AppRoutes.tsx";
import { SidebarProvider } from "./components/ui/sidebar.tsx";

registerSW({
  onNeedRefresh() {
    /* opcional: mostrar toast para atualizar */
  },
  onOfflineReady() {
    /* opcional: avisar que está pronto offline */
  },
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <PersistGate persistor={persistor}>
        <Provider store={store}>
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </Provider>
      </PersistGate>
    </QueryClientProvider>
  </StrictMode>
);
