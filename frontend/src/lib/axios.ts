import axios from "axios";
import { store } from "@/store";
import { type RootState } from "@/store";
import { signOut } from "@/store/authSlice";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "https://apinutrifit.mujapira.com/api",
});

api.interceptors.request.use(async (config) => {
  const state = store.getState() as RootState;
  const { accessToken, tokenType, expiresAt } = state.auth;

  // Verifica se o token expirou
  if (accessToken && expiresAt && Date.now() > expiresAt) {
    store.dispatch(signOut());
    return config;
  }

  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `${tokenType} ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    console.log("Response error interceptor triggered:", error);
    if (error.response?.status === 401) {
      console.log("Received 401 response, signing out.", error);
      store.dispatch(signOut());
    }
    return Promise.reject(error);
  }
);
