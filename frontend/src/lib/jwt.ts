// src/lib/jwt.ts
import { jwtDecode } from "jwt-decode";
import { UserProfiles } from "@/types/user";

export type DecodedJwtRaw = {
  id?: string;
  name?: string;
  isAdmin?: boolean | string;
  profile?: string;
  firstAccess?: boolean | string;
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
  firstAccess: boolean;
  invited: boolean;
  professionalInviterId: string | null;
  expMs: number | null;
  raw: DecodedJwtRaw;
};

function normalizeProfile(profile: unknown): string | null {
  if (typeof profile !== "string") return null;

  const value = profile.trim();
  const lower = value.toLowerCase();

  if (value === UserProfiles.STUDENT || lower === "student") {
    return UserProfiles.STUDENT;
  }

  if (value === UserProfiles.PERSONAL || lower === "personal") {
    return UserProfiles.PERSONAL;
  }

  if (value === UserProfiles.NUTRITIONIST || lower === "nutritionist") {
    return UserProfiles.NUTRITIONIST;
  }

  if (value === UserProfiles.SELF_MANAGED || lower === "selfmanaged" || lower === "self_managed") {
    return UserProfiles.SELF_MANAGED;
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

    const firstAccessBool =
      typeof raw.firstAccess === "boolean"
        ? raw.firstAccess
        : typeof raw.firstAccess === "string"
        ? raw.firstAccess.toLowerCase() === "true"
        : false;

    const expMs = typeof raw.exp === "number" ? raw.exp * 1000 : null;

    return {
      id: raw.id ?? null,
      name: raw.name ?? null,
      email: raw.email ?? raw.sub ?? null,
      isAdmin: isAdminBool,
      profile: normalizeProfile(raw.profile),
      firstAccess: firstAccessBool,
      invited: invitedBool,
      professionalInviterId: raw.professionalInviterId ?? null,
      expMs,
      raw,
    };
  } catch {
    return null;
  }
}
