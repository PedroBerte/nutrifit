// src/store/authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { decodeAndNormalizeJwt } from "@/lib/jwt";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string;
  expiresAt: number | null;
  user?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    isAdmin?: boolean;
    profile?: string | null;
  } | null;
};

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  tokenType: "Bearer",
  expiresAt: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signIn: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken?: string | null;
        tokenType?: string;
        expiresIn?: number;
        user?: AuthState["user"];
      }>
    ) => {
      const { accessToken, refreshToken, tokenType, expiresIn, user } =
        action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken ?? null;
      state.tokenType = tokenType ?? "Bearer";

      const decoded = decodeAndNormalizeJwt(accessToken);
      state.expiresAt =
        typeof expiresIn === "number"
          ? Date.now() + expiresIn * 1000
          : decoded?.expMs ?? null;

      state.user =
        user ??
        (decoded
          ? {
              id: decoded.id,
              name: decoded.name,
              email: decoded.email,
              isAdmin: decoded.isAdmin,
              profile: decoded.profile,
            }
          : null);
    },

    signInFromJwt: (
      state,
      action: PayloadAction<{ accessToken: string; tokenType?: string }>
    ) => {
      const { accessToken, tokenType } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = null;
      state.tokenType = tokenType ?? "Bearer";

      const decoded = decodeAndNormalizeJwt(accessToken);
      state.expiresAt = decoded?.expMs ?? null;
      state.user = decoded
        ? {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            isAdmin: decoded.isAdmin,
            profile: decoded.profile ?? null,
          }
        : null;
    },

    signOut: (state) => {
      Object.assign(state, initialState);
    },

    setTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        expiresIn?: number;
        refreshToken?: string | null;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;

      const decoded = decodeAndNormalizeJwt(action.payload.accessToken);
      state.expiresAt =
        typeof action.payload.expiresIn === "number"
          ? Date.now() + action.payload.expiresIn * 1000
          : decoded?.expMs ?? null;

      if (action.payload.refreshToken !== undefined) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
  },
});

export const { signIn, signInFromJwt, signOut, setTokens } = authSlice.actions;
export default authSlice.reducer;
