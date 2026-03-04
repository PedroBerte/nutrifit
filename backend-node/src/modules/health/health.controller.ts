import { Request, Response } from "express";

import { getHealthStatus } from "./health.service";

export function getHealth(_request: Request, response: Response): void {
  response.status(200).json(getHealthStatus());
}
