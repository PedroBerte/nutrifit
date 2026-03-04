import { Request, Response } from "express";
import { createFeedback, listFeedbacksByProfessional, getFeedbackById } from "./feedback.service";
import { createFeedbackSchema } from "./feedback.schemas";

export async function create(req: Request, res: Response) {
  return res.status(201).json(await createFeedback(req.user!.id, createFeedbackSchema.parse(req.body)));
}
export async function listByProfessional(req: Request, res: Response) {
  const { professionalId } = req.query as { professionalId: string };
  return res.json(await listFeedbacksByProfessional(professionalId));
}
export async function getById(req: Request, res: Response) {
  return res.json(await getFeedbackById(String(req.params.id)));
}
