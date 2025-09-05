// src/lib/jwt.ts
import { jwtDecode } from "jwt-decode";

export type DecodedJwtRaw = {
  id?: string;
  name?: string;
  isAdmin?: boolean | string;
  roles?: string | string[];
  sub?: string;
  email?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
  jti?: string;
  [k: string]: unknown;
};

export type DecodedJwt = {
  id: string | null;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
  roles: string[];
  expMs: number | null;
  raw: DecodedJwtRaw;
};

export function decodeAndNormalizeJwt(token: string | null): DecodedJwt | null {
  if (!token) return null;
  try {
    const raw = jwtDecode<DecodedJwtRaw>(token);

    const rolesArray = Array.isArray(raw.roles)
      ? raw.roles
      : typeof raw.roles === "string" && raw.roles.length > 0
      ? raw.roles
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean)
      : [];

    const isAdminBool =
      typeof raw.isAdmin === "boolean"
        ? raw.isAdmin
        : typeof raw.isAdmin === "string"
        ? raw.isAdmin.toLowerCase() === "true"
        : false;

    const expMs = typeof raw.exp === "number" ? raw.exp * 1000 : null;

    return {
      id: raw.id ?? null,
      name: raw.name ?? null,
      email: raw.email ?? raw.sub ?? null,
      isAdmin: isAdminBool,
      roles: rolesArray,
      expMs,
      raw,
    };
  } catch {
    return null;
  }
}
