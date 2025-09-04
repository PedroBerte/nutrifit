// src/store/authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string;
  expiresAt: number | null; // timestamp em ms
  user?: { email?: string } | null;
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
        expiresIn: number;
        user?: AuthState["user"];
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.tokenType = action.payload.tokenType ?? "Bearer";
      state.expiresAt = Date.now() + action.payload.expiresIn * 1000;
      state.user = action.payload.user ?? null;
    },
    signOut: (state) => {
      Object.assign(state, initialState);
    },
    setTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        expiresIn: number;
        refreshToken?: string | null;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.expiresAt = Date.now() + action.payload.expiresIn * 1000;
      if (action.payload.refreshToken !== undefined) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
  },
});

export const { signIn, signOut, setTokens } = authSlice.actions;
export default authSlice.reducer;
