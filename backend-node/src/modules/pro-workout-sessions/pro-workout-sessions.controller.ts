import { Request, Response } from "express";
import { startProSession, listProSessions, getProSessionById, finishProSession } from "./pro-workout-sessions.service";
import { startSessionSchema, finishSessionSchema } from "./pro-workout-sessions.schemas";

export async function start(req: Request, res: Response) {
  return res.status(201).json(await startProSession(req.user!.id, startSessionSchema.parse(req.body)));
}
export async function list(req: Request, res: Response) {
  return res.json(await listProSessions(req.user!.id));
}
export async function getById(req: Request, res: Response) {
  return res.json(await getProSessionById(req.user!.id, String(req.params.sessionId)));
}
export async function finish(req: Request, res: Response) {
  return res.json(await finishProSession(req.user!.id, String(req.params.sessionId), finishSessionSchema.parse(req.body)));
}
