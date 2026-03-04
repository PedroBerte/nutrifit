import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { AppError } from "../../common/app-error";
import { findUserByEmail, SelfManagedUser } from "../self-managed/self-managed.store";
import { AuthClaims } from "./auth.types";

const DEFAULT_EXPIRES_IN = "12h";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  return secret && secret.length > 0 ? secret : "dev-secret-change-me";
}

function toClaims(user: SelfManagedUser): AuthClaims {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: false,
    profile: "SelfManaged",
  };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function validatePassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function createAccessToken(claims: AuthClaims) {
  return jwt.sign(claims, getJwtSecret(), { expiresIn: DEFAULT_EXPIRES_IN });
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthClaims & { iat?: number; exp?: number };
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
}

export async function authenticateSelfManagedUser(input: { email: string; password: string }) {
  const user = await findUserByEmail(input.email);
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isValidPassword = await validatePassword(input.password, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError("Invalid credentials", 401);
  }

  const claims = toClaims(user);

  return {
    token: createAccessToken(claims),
    user: claims,
  };
}
