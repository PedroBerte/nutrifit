import axios from "axios";
import { store } from "@/store";
import { type RootState } from "@/store";
import { setTokens, signOut } from "@/store/authSlice";

export const api = axios.create({
  baseURL: "https://localhost:7073/api",
});

function isExpiringSoon(expiresAt: number | null) {
  if (!expiresAt) return true;
  return Date.now() > expiresAt - 30_000;
}

let refreshing: Promise<void> | null = null;

async function refreshIfNeeded() {
  const state = store.getState() as RootState;
  const { accessToken, refreshToken, expiresAt } = state.auth;

  if (!accessToken) return;
  if (!isExpiringSoon(expiresAt)) return;

  if (!refreshToken) return;

  if (!refreshing) {
    refreshing = (async () => {
      try {
        const { data } = await api.post("/authentication/refresh", {
          refreshToken,
        });
        store.dispatch(
          setTokens({
            accessToken: data.accessToken,
            expiresIn: data.expiresIn,
            refreshToken: data.refreshToken,
          })
        );
      } catch {
        store.dispatch(signOut());
      } finally {
        refreshing = null;
      }
    })();
  }
  await refreshing;
}

api.interceptors.request.use(async (config) => {
  const state = store.getState() as RootState;
  console.log("Current auth state in interceptor:", state.auth);
  const { accessToken, tokenType } = state.auth;

  if (accessToken) {
    await refreshIfNeeded();
    const s2 = store.getState() as RootState;
    const { accessToken: fresh, tokenType: tt } = s2.auth;
    if (fresh) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `${tt} ${fresh}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      store.dispatch(signOut());
    }
    return Promise.reject(error);
  }
);
