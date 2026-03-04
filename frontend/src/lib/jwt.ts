// src/lib/jwt.ts
import { jwtDecode } from "jwt-decode";
import { UserProfiles } from "@/types/user";

export type DecodedJwtRaw = {
  id?: string;
  name?: string;
  isAdmin?: boolean | string;
  profile?: string;
  invited?: boolean | string;
  professionalInviterId?: string;
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
  profile: string | null;
  invited: boolean;
  professionalInviterId: string | null;
  expMs: number | null;
  raw: DecodedJwtRaw;
};

function normalizeProfile(profile: unknown): string | null {
  if (typeof profile !== "string") return null;

  const value = profile.trim();
  const lower = value.toLowerCase();

  if (value === UserProfiles.STUDENT || lower === "student" || lower === "selfmanaged") {
    return UserProfiles.STUDENT;
  }

  if (value === UserProfiles.PERSONAL || lower === "personal") {
    return UserProfiles.PERSONAL;
  }

  if (value === UserProfiles.NUTRITIONIST || lower === "nutritionist") {
    return UserProfiles.NUTRITIONIST;
  }

  return value;
}

export function decodeAndNormalizeJwt(token: string | null): DecodedJwt | null {
  if (!token) return null;
  try {
    const raw = jwtDecode<DecodedJwtRaw>(token);

    const isAdminBool =
      typeof raw.isAdmin === "boolean"
        ? raw.isAdmin
        : typeof raw.isAdmin === "string"
        ? raw.isAdmin.toLowerCase() === "true"
        : false;

    const invitedBool =
      typeof raw.invited === "boolean"
        ? raw.invited
        : typeof raw.invited === "string"
        ? raw.invited.toLowerCase() === "true"
        : false;

    const expMs = typeof raw.exp === "number" ? raw.exp * 1000 : null;

    return {
      id: raw.id ?? null,
      name: raw.name ?? null,
      email: raw.email ?? raw.sub ?? null,
      isAdmin: isAdminBool,
      profile: normalizeProfile(raw.profile),
      invited: invitedBool,
      professionalInviterId: raw.professionalInviterId ?? null,
      expMs,
      raw,
    };
  } catch {
    return null;
  }
}
