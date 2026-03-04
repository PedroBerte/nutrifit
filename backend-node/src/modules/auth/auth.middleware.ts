import { NextFunction, Request, Response } from "express";

import { AppError } from "../../common/app-error";
import { verifyAccessToken } from "./auth.service";

export function ensureAuthenticated(request: Request, _response: Response, next: NextFunction) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError("Missing Bearer token", 401);
  }

  const token = authorization.slice("Bearer ".length).trim();
  const payload = verifyAccessToken(token);

  request.user = payload;

  next();
}
