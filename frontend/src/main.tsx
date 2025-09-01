import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { registerSW } from "virtual:pwa-register";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Callback from "./pages/CallbackLogin.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

registerSW({
  onNeedRefresh() {
    /* opcional: mostrar toast para atualizar */
  },
  onOfflineReady() {
    /* opcional: avisar que está pronto offline */
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "login", element: <Login /> },
      { path: "/login/callback", element: <Callback /> },
      { path: "*", element: <Login /> },
    ],
  },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
