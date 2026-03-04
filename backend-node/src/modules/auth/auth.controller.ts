import { Request, Response } from "express";

import { authenticateSelfManagedUser, createAccessToken, hashPassword } from "./auth.service";
import { loginSelfManagedSchema, registerSelfManagedSchema } from "./auth.schemas";
import { registerSelfManagedUser } from "../self-managed/self-managed.service";
import { sendMagicLink, validateMagicLink } from "./magic-link.service";

export async function registerSelfManaged(request: Request, response: Response) {
  const payload = registerSelfManagedSchema.parse(request.body);

  const passwordHash = await hashPassword(payload.password);
  const user = await registerSelfManagedUser({
    name: payload.name,
    email: payload.email,
    passwordHash,
  });

  const tokenPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: false,
    profile: "SelfManaged",
  };

  return response.status(201).json({
    token: createAccessToken(tokenPayload),
    user: tokenPayload,
  });
}

export async function loginSelfManaged(request: Request, response: Response) {
  const payload = loginSelfManagedSchema.parse(request.body);
  const data = await authenticateSelfManagedUser(payload);

  return response.status(200).json(data);
}

export async function sendMagicLinkHandler(request: Request, response: Response) {
  const { email, baseAppUrl, invited, professionalInviterId } = request.body as {
    email: string;
    baseAppUrl?: string;
    invited?: boolean;
    professionalInviterId?: string;
  };
  const appUrl = baseAppUrl ?? (request.headers["x-app-baseurl"] as string) ?? "http://localhost:5173";
  const ip = request.socket.remoteAddress ?? "";
  const ua = request.headers["user-agent"] ?? "";
  await sendMagicLink(email, appUrl, ip, ua, invited, professionalInviterId);
  return response.status(200).json({ message: "Magic link sent" });
}

export async function validateMagicLinkHandler(request: Request, response: Response) {
  const { token } = request.query as { token: string };
  const jwt = await validateMagicLink(token);
  return response.status(200).json({ token: jwt });
}
